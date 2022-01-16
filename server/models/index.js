const User = require('./User');
const Thought = require('./Thought');
// we have three schemas but only two actual models being made, as reactions will be nested inside thoughts.

module.exports = { User, Thought };
