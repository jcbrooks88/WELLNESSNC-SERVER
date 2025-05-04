import { discussionQueries } from "./queries.js";
import { discussionMutations } from "./mutations.js";
export const discussionResolver = {
    Query: discussionQueries,
    Mutation: discussionMutations,
};
