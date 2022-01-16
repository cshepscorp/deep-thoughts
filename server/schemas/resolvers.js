const { User, Thought } = require('../models');
// built-in error handling from gql
const { AuthenticationError } = require('apollo-server-express');

// serve responses
const resolvers = {
  Query: {
    // retrieve an array of all thought data from the database
    // we pass in the parent as more of a placeholder parameter. It won't be used, but we need something in that first parameter's spot so we can access the username argument from the second parameter. deconstruct the username from the parent
    thoughts: async (parent, { username }) => {
      // when we query thoughts, we will perform a .find() method on the Thought model in desc order via sort
      const params = username ? { username } : {}; // ternary operator to check if username exists; If it does, we set params to an object with a username key set to that value. If it doesn't, we simply return an empty object.
      return Thought.find(params).sort({ createdAt: -1 }); // pass that object, with or without any data in it, to our .find() method
    },
    // destructure the _id argument value and place it into our .findOne() method to look up a single thought by its _id
    thought: async (parent, { _id }) => {
      return Thought.findOne({ _id });
    },
    // get all users
    users: async () => {
      return User.find()
        .select('-__v -password')
        .populate('friends')
        .populate('thoughts');
    },
    // get user by username
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select('-__v -password') // omit the Mongoose-specific __v property and the user's password information
        .populate('friends')
        .populate('thoughts');
    },
    //  We don't have to worry about error handling here because Apollo can infer if something goes wrong and will respond for us
  },
  Mutation: {
    addUser: async (parent, args) => {
      // Mongoose User model creates a new user in the database with whatever is passed in as the args
      const user = await User.create(args);

      return user;
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      // Normally, throwing an error like this would cause your server to crash, but GraphQL will catch the error and send it to the client instead.
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      return user;
    },
  },
};

module.exports = resolvers;
