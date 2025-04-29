import { userResolver } from "./user/resolver.js";
import { discussionResolver } from "./discussions/resolver.js";

export const resolvers = {
  Query: {
    ...userResolver.Query,
    ...discussionResolver.Query,
    // Add other resolvers here later
  },
  Mutation: {
    ...userResolver.Mutation,
    ...discussionResolver.Mutation,
    // Add other resolvers here later
  },
};
