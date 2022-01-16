const { User, Thought } = require('../models');
// built-in error handling from gql
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

// serve responses
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('thoughts')
          .populate('friends');

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },
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
        .populate('thoughts')
        .populate('friends');
    },
    // get user by username
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select('-__v -password') // omit the Mongoose-specific __v property and the user's password information
        .populate('thoughts')
        .populate('friends');
    },
    //  We don't have to worry about error handling here because Apollo can infer if something goes wrong and will respond for us
  },
  Mutation: {
    addUser: async (parent, args) => {
      // Mongoose User model creates a new user in the database with whatever is passed in as the args
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
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

      const token = signToken(user);
      return { token, user };
    },
    // Only logged-in users should be able to use this mutation, hence why we check for the existence of context.user first
    // decoded JWT is only added to context if the verification passes. The token includes the user's username, email, and _id properties, which become properties of context.user and can be used in the follow-up Thought.create() and User.findByIdAndUpdate() methods
    addThought: async (parent, args, context) => {
      if (context.user) {
        const thought = await Thought.create({
          ...args,
          username: context.user.username,
        });

        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { thoughts: thought._id } },
          { new: true } // without the { new: true } flag in User.findByIdAndUpdate(), Mongo would return the original document instead of the updated document
        );

        return thought;
      }
      throw new AuthenticationError('you need to be logged in!');
    },
    addReaction: async (parent, { thoughtId, reactionBody }, context) => {
      if (context.user) {
        const updatedThought = await Thought.findOneAndUpdate(
          { _id: thoughtId },
          // Reactions are stored as arrays on the Thought model, so you'll use the Mongo $push operator
          {
            $push: {
              reactions: { reactionBody, username: context.user.username },
            },
          },
          { new: true, runValidators: true }
        );

        return updatedThought;
      }

      throw new AuthenticationError('you need to be logged in!');
    },
    addFriend: async (parent, { friendId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { friends: friendId } }, // A user can't be friends with the same person twice, so we're using the $addToSet operator instead of $push to prevent duplicate entries
          { new: true }
        ).populate('friends');

        return updatedUser;
      }

      throw new AuthenticationError('you need to be logged in!');
    },
  },
};

module.exports = resolvers;
