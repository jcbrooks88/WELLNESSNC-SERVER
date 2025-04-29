import { gql } from "apollo-server-express";

export const discussionTypeDefs = gql`
  type Discussion {
    _id: ID!
    title: String!
    content: String!
    keywords: [String!]!
    author: User!
    createdAt: String
    updatedAt: String
  }

  type Query {
    getDiscussions: [Discussion]
    getDiscussionByID(id: ID!): Discussion
    searchDiscussions(title: String, keywords: [String!]): [Discussion]
  }

  type Mutation {
    createDiscussion(title: String!, content: String!, keywords: [String!]!): Discussion
  }
`;
