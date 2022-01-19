import { gql } from "@apollo/client";

// email and password values will be psased into the mutation as args
// expecting that users' token, id and username in return
export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

// same as above but now ask for their email as well
export const ADD_USER = gql`
  mutation addUser($username:String!, $email: String!, $password: String!) {
      addUser(username: $username, email: $email, password: $password) {
          token
          user {
              _id
              username
          }
      }
  }
`;