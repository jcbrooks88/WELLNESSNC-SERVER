import { GraphQLError } from "graphql";
import { User } from "../../../mongoDB/models/User.js";
import Discussion from "../../../mongoDB/models/Discussion.js";

export const userQueries = {
  user: async (_: any, { _id }: any, context: any) => {
    if (!context.user) throw new GraphQLError("You must be logged in.");

    const user = await User.findById(_id)
      .populate("profileComments.author", "_id username avatarUrl")
      .lean();

    if (!user) throw new Error("User not found.");

    const discussions = await Discussion.find({ author: user._id }).lean();

    return {
      ...user,
      discussions,
      workHistory: user.workHistory,
    };
  },

  me: async (_: any, __: any, context: any) => {
    if (!context.user) throw new GraphQLError("You must be logged in.");

    const user = await User.findById(context.user._id)
      .populate("profileComments.author", "_id username avatarUrl")
      .lean();

    if (!user) throw new Error("User not found.");

    const discussions = await Discussion.find({ author: user._id }).lean();

    return {
      ...user,
      discussions,
      workHistory: user.workHistory,
    };
  }
};

