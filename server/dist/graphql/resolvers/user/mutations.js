import { AuthenticationError } from "apollo-server-express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../../mongoDB/models/User.js";
import { generateAccessToken, generateRefreshToken } from "../../../utils/generateToken.js";
import { ENV } from "../../../utils/configLoader.js";
export const userMutations = {
    register: async (_, args, { res }) => {
        const { username, firstName, lastName, email, password } = args;
        const existingUser = await User.findOne({ email });
        if (existingUser)
            throw new Error("User already exists");
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, firstName, lastName, email, password: hashedPassword });
        await user.save();
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        if (res) {
            res.cookie("jid", refreshToken, {
                httpOnly: true,
                path: "/graphql",
                secure: ENV.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
        }
        return {
            _id: user._id,
            username: user.username,
            email: user.email,
            token: accessToken,
            user: user.toObject(),
        };
    },
    login: async (_, args, { res }) => {
        const { email, password } = args;
        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            throw new Error("Invalid credentials");
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        if (res) {
            res.cookie("jid", refreshToken, {
                httpOnly: true,
                path: "/graphql",
                secure: ENV.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
        }
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
    refreshAccessToken: async (_, __, context) => {
        const token = context.req?.cookies?.jid;
        if (!token)
            throw new Error("No refresh token found");
        try {
            const decoded = jwt.verify(token, ENV.REFRESH_SECRET);
            const newAccessToken = generateAccessToken(decoded.data);
            return { token: newAccessToken };
        }
        catch (err) {
            console.error("Refresh token error:", err);
            throw new Error("Invalid or expired refresh token");
        }
    },
    updateAboutMe: async (_, args, context) => {
        if (!context.user)
            throw new AuthenticationError("You must be logged in.");
        const user = await User.findById(context.user._id);
        if (!user)
            throw new Error("User not found.");
        user.aboutMe = args.aboutMe;
        await user.save();
        return user.toObject();
    },
    addProfileComment: async (_, args, context) => {
        if (!context.user)
            throw new AuthenticationError("You must be logged in.");
        const targetUser = await User.findById(args._id);
        if (!targetUser)
            throw new Error("User not found.");
        const newComment = {
            text: args.text,
            author: context.user._id,
        };
        if (!targetUser.profileComments) {
            targetUser.profileComments = [];
        }
        targetUser.profileComments.push(newComment);
        await targetUser.save();
        return newComment;
    },
    updateUserProfile: async (_, args, context) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const allowedFields = ['username', 'location', 'role', 'aboutMe'];
        const updates = {};
        for (const key of allowedFields) {
            if (args.input[key] !== undefined) {
                updates[key] = args.input[key];
            }
        }
        try {
            const updatedUser = await User.findByIdAndUpdate(context.user._id, { $set: updates }, { new: true, runValidators: true });
            return updatedUser;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error('Failed to update profile: ' + error.message);
            }
            else {
                throw new Error('Failed to update profile due to an unknown error');
            }
        }
    },
};
