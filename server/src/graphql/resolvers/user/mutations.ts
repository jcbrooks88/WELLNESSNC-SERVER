import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { Response } from "express";

import { User } from "../../../mongoDB/models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/generateToken.js";
import { ENV } from "../../../utils/configLoader.js";
import { UserPayload } from "../../../mongoDB/types/userTypes.js";


interface GraphQLContext {
  req: {
    cookies: { [key: string]: string };
  };
  res: Response;
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

interface RegisterArgs {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface UpdateAboutMeArgs {
  aboutMe: string;
}

interface AddProfileCommentArgs {
  _id: string;
  text: string;
}

interface UpdateUserProfileArgs {
  input: {
    username?: string;
    location?: string;
    role?: string;
    aboutMe?: string;
  };
}

export const userMutations = {
  register: async (
    _: any,
    args: RegisterArgs,
    { res }: { res: Response }
  ) => {
    const { username, firstName, lastName, email, password } = args;
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res?.cookie("jid", refreshToken, {
      httpOnly: true,
      path: "/graphql",
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      token: accessToken,
      user: user.toObject(),
    };
  },

  login: async (_: any, args: LoginArgs, { res }: { res: Response }) => {
    const { email, password } = args;
    const user = await User.findOne({ email }).select("+password") as UserPayload;
    if (!user || !(await user.comparePassword(password))) {
      throw new Error("Invalid credentials");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res?.cookie("jid", refreshToken, {
      httpOnly: true,
      path: "/graphql",
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      token: accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  },

  refreshAccessToken: async (_: any, __: any, { req }: GraphQLContext) => {
    const token = req?.cookies?.jid;
    if (!token) throw new Error("No refresh token found");

    try {
      const decoded: any = jwt.verify(token, ENV.REFRESH_SECRET);
      const newAccessToken = generateAccessToken(decoded.data);
      return { token: newAccessToken };
    } catch (err) {
      console.error("Refresh token error:", err);
      throw new Error("Invalid or expired refresh token");
    }
  },

  updateAboutMe: async (_: any, args: UpdateAboutMeArgs, { user }: GraphQLContext) => {
    if (!user) {
      throw new GraphQLError("You must be logged in.", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const foundUser = await User.findById(user._id);
    if (!foundUser) throw new Error("User not found.");

    foundUser.aboutMe = args.aboutMe;
    await foundUser.save();
    return foundUser.toObject();
  },

  addProfileComment: async (_: any, args: AddProfileCommentArgs, { user }: GraphQLContext) => {
    if (!user) {
      throw new GraphQLError("You must be logged in.", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const targetUser = await User.findById(args._id);
    if (!targetUser) throw new Error("User not found.");

    const newComment = {
      text: args.text,
      author: user._id,
    };

    targetUser.profileComments ??= [];
    targetUser.profileComments.push(newComment as any);
    await targetUser.save();

    return newComment;
  },

  updateUserProfile: async (_: any, args: UpdateUserProfileArgs, { user }: GraphQLContext) => {
    if (!user) {
      throw new GraphQLError("Not authenticated", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const allowedFields = ["username", "location", "role", "aboutMe"] as const;
    const updates = Object.fromEntries(
      Object.entries(args.input).filter(([key, val]) =>
        allowedFields.includes(key as any) && val !== undefined
      )
    );

    try {
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updates },
        { new: true, runValidators: true }
      );
      return updatedUser;
    } catch (err: any) {
      throw new Error("Failed to update profile: " + err.message);
    }
  },
};
