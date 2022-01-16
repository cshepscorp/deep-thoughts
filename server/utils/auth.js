const jwt = require('jsonwebtoken');

const secret = 'mysecretsshhhhh'; // the secret has nothing to do with encoding. The secret merely enables the server to verify whether it recognizes this token
const expiration = '2h';

module.exports = {
    // The signToken() function expects a user object and will add that user's username, email, and _id properties to the token
    signToken: function({ username, email, _id }) {
        const payload = { username, email, _id };
    

    // Optionally, tokens can be given an expiration date and a secret to sign the token with
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
