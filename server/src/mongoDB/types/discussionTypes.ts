import mongoose from "mongoose";

export interface IDiscussion extends Document {
    title: string;
    content: string;
    keywords: string[];
    author: mongoose.Types.ObjectId;
  }
 
  