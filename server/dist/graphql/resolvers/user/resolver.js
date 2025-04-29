import { userQueries } from "./queries.js";
import { userMutations } from "./mutations.js";
export const userResolver = {
    Query: userQueries,
    Mutation: userMutations,
};
