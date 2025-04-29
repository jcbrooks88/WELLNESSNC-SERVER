import Discussion from "../../../mongoDB/models/Discussion.js";
export const discussionQueries = {
    // Returns all discussions
    getDiscussions: async () => {
        try {
            const discussions = await Discussion.find().populate("author");
            console.log("✅ Server-side discussions:", discussions);
            return discussions;
        }
        catch (err) {
            console.error("❌ Server-side error fetching discussions:", err);
            return null;
        }
    },
    // Returns a single discussion by ID
    getDiscussionByID: async (_, { id }) => {
        return await Discussion.findById(id).populate("author");
    },
    // Search by title and/or keywords
    searchDiscussions: async (_, { title, keywords }) => {
        const filters = [];
        if (title) {
            filters.push({ title: { $regex: title, $options: "i" } });
        }
        if (keywords?.length) {
            filters.push({ keywords: { $in: keywords } });
        }
        const query = filters.length > 0 ? { $or: filters } : {};
        return await Discussion.find(query).populate("author");
    },
};
