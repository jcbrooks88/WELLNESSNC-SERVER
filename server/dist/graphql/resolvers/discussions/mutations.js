import Discussion from "../../../mongoDB/models/Discussion.js";
export const discussionMutations = {
    createDiscussion: async (_, { title, content, keywords, }, context) => {
        const author = context.user?._id;
        if (!author) {
            throw new Error("Authentication required");
        }
        return await Discussion.create({ title, content, keywords, author });
    },
};
