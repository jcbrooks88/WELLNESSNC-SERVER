import mongoose, { Schema } from "mongoose";
import { IDiscussion } from "../types/discussionTypes.js";

const DiscussionSchema = new Schema<IDiscussion>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    keywords: { type: [String], required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true, // includes createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// You could optionally define a virtual for `username` if desired
DiscussionSchema.virtual("username").get(function (this: IDiscussion) {
  // Only works if `author` is populated
  if ((this as unknown as mongoose.Document).populated("author") && typeof this.author === "object") {
    return (this.author as any).username || null;
  }
  return null;
});

const Discussion = mongoose.model<IDiscussion>("Discussion", DiscussionSchema);
export default Discussion;
