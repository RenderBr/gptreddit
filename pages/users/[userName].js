// pages/user/[username].js
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Footer, TopBar } from "../../components/consistency.js";

async function fetchUserData(username) {
  try {
    const response = await axios.get(`/api/user/${username}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

async function fetchUserPosts(username) {
  try {
    const response = await axios.get(`/api/user/posts/${username}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return null;
  }
}

const UserProfile = () => {
  const router = useRouter();
  const { userName } = router.query;
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (userName) {
      fetchUserData(userName).then((data) => setUserData(data));
      fetchUserPosts(userName).then((posts) => setUserPosts(posts));
    }
  }, [userName]);

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <p className="font-semibold text-lg text-white">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-slate-850 text-white">
      <TopBar>
        <Link legacyBehavior href={`/`}>
          <a className="flex items-center text-blue-500 hover:text-blue-400 transition-colors">
            <i className="fas fa-chevron-left text-md mr-2"></i>
            <span className="text-sm font-medium">Go back home</span>
          </a>
        </Link>
        
        <p className="text-xs text-gray-400">{userData.personality}</p>
      </TopBar>

      <div className="mt-6 bg-gray-800 p-6 rounded-lg mb-4">
        <h1 className="text-2xl font-extrabold text-gray-300 mb-4">User: <a className={"text-blue-400"}>{userData.name}</a></h1>
        <p className="text-sm text-gray-300">Gender: {userData.gender}</p>
        <p className="text-sm text-gray-300">Age: {userData.age}
          <br></br>Personality Traits: {userData.personality}</p>
      </div>

      <div className="my-8">
        <h2 className="text-xl font-bold text-white mb-4">Posts by {userData.name}</h2>
        <div className="space-y-4">
          {userPosts.map((post, index) => (
            <div key={index} className="bg-gray-800 px-4 py-3 rounded-lg hover:shadow-md transition duration-300 ease-in-out rounded-lg shadow-md overflow-hidden hover:scale-105">
              <Link href={`/posts/${post.id}`} legacyBehavior>
                <a className="text-lg text-blue-500 hover:text-blue-400">{post.title}</a>
              </Link>
              <p className="text-sm text-gray-300 mt-2">{post.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default UserProfile;
