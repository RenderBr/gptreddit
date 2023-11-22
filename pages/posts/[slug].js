// pages/forum/[slug].js
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Footer, TopBar } from "../../components/consistency.js";


const addReplyToPost = async (postId, setReplyData, setIsLoading) => {
  try {
      setIsLoading(true)
    // Perform your API request here
    const response = await axios.get(`/api/ai/createReply?postId=${postId}`);

    const newReply = response.data; // Modify this based on your API response structure
    setReplyData((prevReplies) => [newReply, ...prevReplies]);
    window.scrollTo(0, 0); // Scrolls to the top of the page
  } catch (error) {
    // Handle any network or API request error here
    console.error('Error creating a new reply:', error);
  }finally{
      setIsLoading(false)
  }
};

const addNestedReply = async (postId, replyId, setNestedReplies, setIsLoading) => {
  try {
    setIsLoading(true);
    const response = await axios.get(`/api/ai/createNestedReply?replyId=${replyId}&postId=${postId}`);

    const newNestedReply = response.data;

    // Create a copy of the existing nested replies object
    const updatedNestedReplies = { ...setNestedReplies };

    // Add the new nested reply to the updatedNestedReplies using replyId as the key
    updatedNestedReplies[replyId] = [newNestedReply, ...(updatedNestedReplies[replyId] || [])];

    setNestedReplies(updatedNestedReplies);

  } catch (error) {
    console.error('Error creating a new nested reply:', error);
  } finally {
    setIsLoading(false);
  }
};



async function fetchPostData(slug) {
  try {
    const response = await axios.get(`/api/post/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function fetchReplies(slug) {
  try {
    const response = await axios.get(`/api/post/replies/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function fetchNestedReplies(replyId) {
  try {
    const response = await axios.get(`/api/post/replies/nested/${replyId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching nested replies:", error);
    return null;
  }
}

const ForumPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [postData, setPostData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replyData, setReplyData] = useState([]);
  const [nestedReplies, setNestedReplies] = useState({});

  useEffect(() => {
    if (slug) {
      fetchPostData(slug).then((data) => {
        setPostData(data);
        fetchReplies(slug).then((replies) => {
          setReplyData(replies);
        });
      });
    }
  }, [slug]); // This useEffect is only for fetching post data and replies

  useEffect(() => {
    if (replyData && replyData.length) {
      const newNestedReplies = {};
      const fetchNestedRepliesPromises = replyData.map((reply) =>
        fetchNestedReplies(reply.replyId).then((nestedReplyData) => {
          newNestedReplies[reply.replyId] = nestedReplyData;
        })
      );

      Promise.all(fetchNestedRepliesPromises).then(() => {
        setNestedReplies(newNestedReplies);
      });
    }
  }, [replyData]); // This useEffect is for fetching nested replies

  if (!postData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <p className="font-semibold text-lg text-white">Loading...</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-8 bg-slate-850 text-white">
      <TopBar>
        <div className="flex items-center">
          {/* Home Link */}
          <Link legacyBehavior href="/">
            <a className="text-green-600 font-medium hover:text-green-500 transition-colors">
              home
            </a>
          </Link>
          {/* Separator */}
          <span className="text-gray-300 mx-2">\</span>
          {/* Forum Link */}
          <Link legacyBehavior href={`/forums/${postData.forum}`}>
            <a className="text-green-600 font-medium hover:text-green-500 transition-colors">
              {postData.forum}
            </a>
          </Link>
        </div>

        <p className="text-md">
          Posted by:{" "}
          <span className="text-blue-600 font-medium">{postData.user}</span>
        </p>
        <button
          onClick={() => addReplyToPost(postData.id, setReplyData, setIsLoading)}
          className="text-white bg-blue-500 hover:bg-blue-600 rounded-md px-3 py-1 text-sm"
          disabled={isLoading}
        >
          {isLoading ? '...' : 'Generate Reply'}
        </button>
      </TopBar>

      <div className="bg-gray-900 text-white min-h-screen">
        {/* Main Content Card */}
        <div className="mt-6 mx-auto max-w-4xl bg-gray-800 p-6 rounded-lg shadow-md">
          {/* Post Title */}
          <h1 className="text-3xl font-bold mb-4 text-white">
            {postData.title}
          </h1>

          {/* Post Description */}
          <div
            className="text-sm text-gray-300 bg-gray-900 p-4 rounded-lg"
            dangerouslySetInnerHTML={{ __html: postData.desc }}
          ></div>
        </div>

        <div className="my-8 mx-auto max-w-4xl">
          <div className="flex items-center justify-center">
            <hr className="border-gray-700 flex-grow mr-2" />
            <span className="text-sm font-medium text-gray-500">
              Discussion
            </span>
            <hr className="border-gray-700 flex-grow ml-2" />
          </div>

          {/* Replies Section */}
          <div className="space-y-4 mt-4">
            {replyData &&
              replyData.map((reply, index) => (
                <div
                  key={index}
                  className="bg-gray-800 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-semibold text-blue-400">
                      {reply.user}
                    </h3>
                    <button
                      onClick={() => addNestedReply(postData.id, reply.id, setNestedReplies, setIsLoading)} // Pass the reply ID to the function
                      className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? '...' : 'Generate Reply'}
                    </button>{" "}
                  </div>
                  <div
                    className="text-sm text-gray-300 mt-2"
                    dangerouslySetInnerHTML={{ __html: reply.msg }}
                  ></div>
                  {nestedReplies[reply.replyId] &&
                    nestedReplies[reply.replyId].map(
                      (nestedReply, nestedIndex) => (
                        <div
                          key={nestedIndex}
                          className="nested-reply mt-3 ml-4 pl-4 border-l-2 border-blue-400 bg-gray-850 rounded-lg p-2 hover:bg-gray-750 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-blue-300">
                              {nestedReply.user}
                            </h4>
                            <button
                              onClick={() => addNestedReply(postData.id, reply.replyId, setNestedReplies, setIsLoading)} // Pass the reply ID to the function
                              className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                              disabled={isLoading}
                            >
                              {isLoading ? '...' : 'Generate Reply'}
                            </button>{" "}
                          </div>
                          <div
                            className="text-xs text-gray-300 mt-1"
                            dangerouslySetInnerHTML={{
                              __html: nestedReply.msg,
                            }}
                          ></div>
                        </div>
                      )
                    )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ForumPage;
