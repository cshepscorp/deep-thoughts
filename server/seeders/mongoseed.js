/// require the necessary libraries
const faker = require("faker");
const MongoClient = require("mongodb").MongoClient;

const { Thought, User } = require("../models");

// function randomIntFromInterval(min, max) {
//   // min and max included
//   return Math.floor(Math.random() * (max - min + 1) + min);
// }

async function seedDB() {
  // Connection URL
  const uri =
    "mongodb+srv://christymongo:csmongo123@cluster0.klxjf.mongodb.net/mern-social-media?retryWrites=true&w=majority";

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    // useUnifiedTopology: true,
  });

  // await Thought.deleteMany({});
  // await User.deleteMany({});

  try {
    await client.connect();
    console.log("Connected correctly to server");

    const collection = client.db("Cluster0").collection("mern-social-media");

    // The drop() command destroys all data from a collection.
    // Make sure you run it against proper database and collection.
    collection.drop();

    // make a bunch of time series data
    // let timeSeriesData = [];
    const userData = [];

    for (let i = 0; i < 50; i += 1) {
      const username = faker.internet.userName();
      const email = faker.internet.email(username);
      const password = faker.internet.password();

      userData.push({ username, email, password });
    }

    const createdUsers = await User.collection.insertMany(userData);

    collection.insertMany(timeSeriesData);

    // create friends
    for (let i = 0; i < 100; i += 1) {
      const randomUserIndex = Math.floor(
        Math.random() * createdUsers.ops.length
      );
      const { _id: userId } = createdUsers.ops[randomUserIndex];

      let friendId = userId;

      while (friendId === userId) {
        const randomUserIndex = Math.floor(
          Math.random() * createdUsers.ops.length
        );
        friendId = createdUsers.ops[randomUserIndex];
      }

      await User.updateOne(
        { _id: userId },
        { $addToSet: { friends: friendId } }
      );
    }

    // create thoughts
    let createdThoughts = [];
    for (let i = 0; i < 100; i += 1) {
      const thoughtText = faker.lorem.words(Math.round(Math.random() * 20) + 1);

      const randomUserIndex = Math.floor(
        Math.random() * createdUsers.ops.length
      );
      const { username, _id: userId } = createdUsers.ops[randomUserIndex];

      const createdThought = await Thought.create({ thoughtText, username });

      const updatedUser = await User.updateOne(
        { _id: userId },
        { $push: { thoughts: createdThought._id } }
      );

      createdThoughts.push(createdThought);
    }

    // create reactions
    for (let i = 0; i < 100; i += 1) {
      const reactionBody = faker.lorem.words(
        Math.round(Math.random() * 20) + 1
      );

      const randomUserIndex = Math.floor(
        Math.random() * createdUsers.ops.length
      );
      const { username } = createdUsers.ops[randomUserIndex];

      const randomThoughtIndex = Math.floor(
        Math.random() * createdThoughts.length
      );
      const { _id: thoughtId } = createdThoughts[randomThoughtIndex];

      await Thought.updateOne(
        { _id: thoughtId },
        { $push: { reactions: { reactionBody, username } } },
        { runValidators: true }
      );
    }

    console.log("Database seeded! :)");
    client.close();
  } catch (err) {
    console.log(err.stack);
  }
}

seedDB();
