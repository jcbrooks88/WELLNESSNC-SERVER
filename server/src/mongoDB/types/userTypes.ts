// types/userTypes.ts
import mongoose from "mongoose";

export interface IWorkHistoryItem {
  position: string;
  company: string;
  startDate: Date;
  endDate: Date;
  description: string;
}

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  aboutMe?: string;
  workHistory?: IWorkHistoryItem[];
  posts?: string[];
  comments?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  location?: String;
  role?: String;
  comparePassword(candidatePassword: string): Promise<boolean>;
  profileComments?: Array<{
    text: string;
    author: mongoose.Types.ObjectId;
    createdAt?: Date;
  }>;
}

export interface UserPayload {
  [x: string]: any;
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  role?: string;
  aboutMe?: string;
  profileComments?: ProfileComment[];
  comparePassword(password: string): Promise<boolean>;
}

export interface ProfileComment {
  _id: string;
  text: string;
  author: string; // or UserPayload if populated
}
