// import gql tagged template function
// import the gql tagged template function from apollo-server-express. Tagged templates are an advanced use of template literals, and were introduced with ES6
const { gql } = require('apollo-server-express');

// create our typeDefs
// To define a query, you use the type Query {} data type, which is built into GraphQL
// ! in queries indicates that for that query to be carried out, that data must exist. Otherwise, Apollo will return an error to the client making the request and the query won't even reach the resolver function associated with it
const typeDefs = gql`
  type Thought {
    _id: ID
    thoughtText: String
    createdAt: String
    username: String
    reactionCount: Int
    reactions: [Reaction]
  }

  type Reaction {
    _id: ID
    reactionBody: String
    createdAt: String
    username: String
  }

  type User {
    _id: ID
    username: String
    email: String
    friendCount: Int
    thoughts: [Thought]
    friends: [User]
  }

  type Query {
    users: [User]
    user(username: String!): User
    thoughts(username: String): [Thought]
    thought(_id: ID!): Thought
  }
`;

// export typeDefs
module.exports = typeDefs;
