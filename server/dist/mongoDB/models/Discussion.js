import mongoose, { Schema } from "mongoose";
const DiscussionSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    keywords: { type: [String], required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true, // includes createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// You could optionally define a virtual for `username` if desired
DiscussionSchema.virtual("username").get(function () {
    // Only works if `author` is populated
    if (this.populated("author") && typeof this.author === "object") {
        return this.author.username || null;
    }
    return null;
});
const Discussion = mongoose.model("Discussion", DiscussionSchema);
export default Discussion;
