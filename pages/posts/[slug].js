// pages/forum/[slug].js
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Footer, TopBar } from "../../components/consistency.js";
import { Reply, ReplyComponent } from "../../components/reply.js";
import { formatDistanceToNow } from 'date-fns';

const addReplyToPost = async (postId, setReplyData, setIsLoading) => {
  try {
    setIsLoading(true);
    // Perform your API request here
    const response = await axios.get(`/api/ai/createReply?postId=${postId}`);

    const newReply = response.data; // Modify this based on your API response structure
    setReplyData((prevReplies) => [newReply, ...prevReplies]);
    window.scrollTo(0, 0); // Scrolls to the top of the page
  } catch (error) {
    // Handle any network or API request error here
    console.error("Error creating a new reply:", error);
  } finally {
    setIsLoading(false);
  }
};
const formatTimestamp = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

const addNestedReply = async (
  postId,
  replyId,
  setNestedReplies,
  setIsLoading,
  chosenForum
) => {
  try {
    setIsLoading(true);
    const response = await axios.get(
      `/api/ai/createNestedReply?replyId=${replyId}&postId=${postId}&chosenForum=${chosenForum}`
    );

    const newNestedReply = response.data;

    // Create a copy of the existing nested replies object
    const updatedNestedReplies = { ...setNestedReplies };

    // Add the new nested reply to the updatedNestedReplies using replyId as the key
    updatedNestedReplies[replyId] = [
      newNestedReply,
      ...(updatedNestedReplies[replyId] || []),
    ];

    setNestedReplies(updatedNestedReplies);
  } catch (error) {
    console.error("Error creating a new nested reply:", error);
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

  if (!postData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <p className="font-semibold text-lg text-white">Loading...</p>
      </div>
    );
  }
  return (
    <div><TopBar>
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
        <a className={"text-green-600 font-medium hover:text-green-500 transition-colors"}>
          {postData.forum}
        </a>
      </Link>
    </div>

    <p className="text-md">
      Posted by:{" "}
      <Link href={`/users/${postData.user}`}><span className="text-blue-600 font-medium">{postData.user}</span></Link>
    </p>
    <button
      onClick={() =>
        addReplyToPost(postData.id, setReplyData, setIsLoading)
      }
      className="text-white bg-blue-500 hover:bg-blue-600 rounded-md px-3 py-1 text-sm"
      disabled={isLoading}
    >
      {isLoading ? "..." : "Generate Reply"}
    </button>
  </TopBar>
    <div className="container mx-auto p-8 bg-slate-850 text-white">
      

      <div className="bg-gray-900 text-white min-h-screen">
        {/* Main Content Card */}
        <div className="mt-6 mx-auto max-w-4xl bg-gray-800 px-6 pt-6 pb-3 rounded-lg shadow-md">
          {/* Post Title */}
          <h1 className="text-3xl font-bold mb-4 text-white">
            {postData.title}
          </h1>

          {/* Post Description */}
          <div
            className="text-sm text-gray-300 bg-gray-900 p-4 rounded-lg"
            dangerouslySetInnerHTML={{ __html: postData.desc }}
          ></div>          
          <p className="text-sm mt-3 text-slate-500 text-center">posted {formatTimestamp(postData.createdAt)}</p>

        </div>

        <div className="my-8 mx-auto max-w-4xl">
          {/* Discussion Divider */}
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

                <ReplyComponent
                key={reply.replyId}
                reply={reply}
                addNestedReply={addNestedReply}
                isLoading={isLoading}
                postData={postData}
                setIsLoading={setIsLoading}
                
                />
              

                
              ))}
          </div>
        </div>
      </div>
      
    </div>
    </div>
  );
};
export default ForumPage;
