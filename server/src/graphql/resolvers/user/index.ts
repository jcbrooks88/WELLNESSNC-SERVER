import { userMutations } from './mutations.js';
import { userQueries } from './queries.js';
// Import other resolvers (posts, comments, discussions) as needed
// import { postMutations } from './mutations/postMutations';
// import { discussionMutations } from './mutations/discussionMutations';

export const resolvers = {
  Query: {
    ...userQueries,
    // ...postQueries,
    // ...discussionQueries,
  },
  Mutation: {
    ...userMutations,
    // ...postMutations,
    // ...discussionMutations,
  },
};
