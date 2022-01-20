import React from "react";
import ThoughtList from "../components/ThoughtList";
import FriendList from "../components/FriendList";
import Auth from "../utils/auth";
import ThoughtForm from "../components/ThoughtForm";
import { useQuery } from "@apollo/client";
import { QUERY_THOUGHTS, QUERY_ME_BASIC } from "../utils/queries";

const Home = () => {
  const { loading, data } = useQuery(QUERY_THOUGHTS);
  const thoughts = data?.thoughts || [];

  const loggedIn = Auth.loggedIn();

  // use object destructuring to extract 'data' from 'useQuery Hook's response and rename it 'userData' to be more clear
  const { data: userData } = useQuery(QUERY_ME_BASIC);

  return (
    <main>
      <div className="flex-row justify-space-between">
          {loggedIn && (
            <div className="col-12 mb-3">
              <ThoughtForm />
            </div>
          )}
        {/* if not logged in they'll get full width class */}
        <div className={`col-12 mb-3 ${loggedIn && "col-lg-8"}`}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ThoughtList
              thoughts={thoughts}
              title="Some Feed for Thought(s)..."
            />
          )}
        </div>
        {/* if logged in TRUE and there's data in userData */}
        {loggedIn && userData ? (
          <div className="col-12 col-lg-3 mb-3">
            <FriendList
              username={userData.me.username}
              friendCount={userData.me.friendCount}
              friends={userData.me.friends}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default Home;
