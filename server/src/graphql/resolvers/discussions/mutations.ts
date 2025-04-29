import Discussion from "../../../mongoDB/models/Discussion.js";

export const discussionMutations = {
  createDiscussion: async (
    _: any,
    {
      title,
      content,
      keywords,
    }: { title: string; content: string; keywords: string[] },
    context: any
  ) => {
    const author = context.user?._id;

    if (!author) {
      throw new Error("Authentication required");
    }

    return await Discussion.create({ title, content, keywords, author });
  },
};
