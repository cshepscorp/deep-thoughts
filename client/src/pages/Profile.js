import React from "react";
// redirect allows us to redirect a user to another; kind of like window.replace() but it works without having to refresh
import { Redirect, useParams } from "react-router-dom";

import ThoughtList from "../components/ThoughtList";
import FriendList from "../components/FriendList";

import { useQuery, useMutation } from "@apollo/client";
import { ADD_FRIEND } from "../utils/mutations";
import { QUERY_USER, QUERY_ME } from "../utils/queries";

import Auth from "../utils/auth";
import ThoughtForm from "../components/ThoughtForm";

const Profile = (props) => {
  const [addFriend] = useMutation(ADD_FRIEND);
  const { username: userParam } = useParams();

  // Now if there's a value in userParam that we got from the URL bar, we'll use that value to run the QUERY_USER query. If there's no value in userParam, like if we simply visit /profile as a logged-in user, we'll execute the QUERY_ME query instead.
  const { loading, data } = useQuery(userParam ? QUERY_USER : QUERY_ME, {
    variables: { username: userParam },
  });

  // when we run QUERY_ME, the response will return with our data in the me property; but if it runs QUERY_USER instead, the response will return with our data in the user property. Now we have it set up to check for both.
  const user = data?.me || data?.user || {};

  // redirect to personal page if username is logged-in user's username
  if (Auth.loggedIn() && Auth.getProfile().data.username === userParam) {
    return <Redirect to="/profile" />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  // if there is no user data to display, we know that we aren't logged in or at another user's profile page
  if (!user?.username) {
    return (
      <h4>
        You need to be logged in to see this page. Use the navigation links
        above to sign up or log in!
      </h4>
    );
  }

  const handleClick = async () => {
    try {
      await addFriend({
        variables: { id: user._id },
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex-row mb-3">
        <h2 className="bg-dark text-secondary p-3 display-inline-block">
          {/* if userParam doesn't exist, we'll get a message saying "Viewing your profile." Otherwise, it will display the username of the other user on their profile. */}
          Viewing {userParam ? `${user.username}'s` : "your"} profile.
        </h2>
        {userParam && (
          <button className="btn ml-auto" onClick={handleClick}>
            Add Friend
          </button>
        )}
      </div>

      <div className="flex-row justify-space-between mb-3">
        <div className="col-12 mb-3 col-lg-8">
          <ThoughtList
            thoughts={user.thoughts}
            title={`${user.username}'s thoughts...`}
          />
        </div>

        <div className="col-12 col-lg-3 mb-3">
          <FriendList
            username={user.username}
            friendCount={user.friendCount}
            friends={user.friends}
          />
        </div>
      </div>
      <div className='mb-3'>
        {!userParam && <ThoughtForm />}
      </div>
    </div>
  );
};

export default Profile;
