const mongoose = require('mongoose');

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/deep-thoughts',
  {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true, // apply to v5 but break v6
    useFindAndModify: false
  }
);

module.exports = mongoose.connection;