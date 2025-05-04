// Combines all typeDefs
import { userTypeDefs } from "./user.js";
import { discussionTypeDefs } from "./discussions.js";
import { mergeTypeDefs } from "@graphql-tools/merge";
export const typeDefs = mergeTypeDefs([userTypeDefs, discussionTypeDefs]);
