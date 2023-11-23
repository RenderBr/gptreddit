import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const addNestedReply = async (
  postId,
  replyId,
  setLocalNestedReplies,
  setIsLoading,
  forum
) => {
  try {
    setIsLoading(true);
    const response = await axios.get(
      `/api/ai/createNestedReply?replyId=${replyId}&postId=${postId}&chosenForum=${forum}`
    );

    const newNestedReply = response.data;

    // Update localNestedReplies state with the new reply
    setLocalNestedReplies(prevReplies => [
      ...prevReplies,
      newNestedReply
    ]);
  } catch (error) {
    console.error("Error creating a new nested reply:", error);
  } finally {
    setIsLoading(false);
  }
};
const formatTimestamp = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const ReplyComponent = ({ 
  reply, 
  isLoading, 
  postData, 
  setIsLoading 
}) => {
  const [localNestedReplies, setLocalNestedReplies] = useState([]);

  useEffect(() => {
    const fetchNestedReplies = async () => {
      try {
        const response = await axios.get(`/api/post/replies/nested/${reply.replyId}`);
        setLocalNestedReplies(response.data || []);
      } catch (error) {
        console.error("Error fetching nested replies:", error);
      }
    };

    fetchNestedReplies();
  }, [reply.replyId]);

  return (
    <div>
      <div className="bg-gray-800 mb-2 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
          <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-blue-400">
                  <Link href={`/users/${reply.user}`}>{reply.user}</Link> <small className={"text-gray-500 ml-2"}>posted {formatTimestamp(reply.createdAt ?? Date.now())}</small>
              </h3>
              <button
                  onClick={() => addNestedReply(
                      postData.id,
                      reply.replyId,
                      setLocalNestedReplies,
                      setIsLoading,
                      postData.forum
                  )}
                  className={`text-xs text-blue-500 hover:text-blue-400 transition-colors`}
                  disabled={isLoading}
              >
                  {isLoading ? "..." : "Generate Reply"}
              </button>
          </div>
          <div className="text-sm text-gray-300 mt-2" dangerouslySetInnerHTML={{ __html: reply.msg }}></div>
      </div>
      {/* Nested Replies */}
      {localNestedReplies.length > 0 && localNestedReplies.map((nestedReply) => (
          <div className="pl-4 border-l border-gray-700">
              <ReplyComponent 
                  key={nestedReply.replyId} 
                  reply={nestedReply}
                  isLoading={isLoading}
                  postData={postData}
                  setIsLoading={setIsLoading}
              />
          </div>
      ))}
    </div>
  );
}
