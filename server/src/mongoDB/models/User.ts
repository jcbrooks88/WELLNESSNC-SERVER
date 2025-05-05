// models/User.ts
import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../types/userTypes.js";

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Must match a valid email address"],
    },
    password: { type: String, required: true, minlength: 4, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    bio: { type: String, default: "" },
    aboutMe: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    location: { type: String, default: "" },
    role: { type: String, default: "user" },
    workHistory: {
      type: [
        {
          position: { type: String },
          company: { type: String },
          startDate: { type: Date },
          endDate: { type: Date },
          description: { type: String },
        },
      ],
      default: [],
    },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    profileComments: {
      type: [
        {
          text: { type: String, required: true },
          author: { type: Schema.Types.ObjectId, ref: "User", required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Virtual full name
userSchema.virtual("fullName").get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>("User", userSchema);
