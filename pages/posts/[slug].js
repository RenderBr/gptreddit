// pages/forum/[slug].js
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

async function fetchPostData(slug) {
    try {
        const response = await axios.get(`/api/post/${slug}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};

async function fetchReplies(slug) {
    try {
        const response = await axios.get(`/api/post/replies/${slug}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};

async function fetchNestedReplies(replyId) {
    try {
        const response = await axios.get(`/api/post/replies/nested/${replyId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching nested replies:', error);
        return null;
    }
}

const ForumPage = () => {
    const router = useRouter();
    const { slug } = router.query;
    const [postData, setPostData] = useState(null);
    const [replyData, setReplyData] = useState(null);
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
            const fetchNestedRepliesPromises = replyData.map(reply => 
                fetchNestedReplies(reply.replyId).then(nestedReplyData => {
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
    {/* Top Bar - Forum Information */}
    <div className="fixed top-0 left-0 w-full bg-gray-800 px-3 py-2 mb-6 z-50">
    <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
            <i className="fas fa-users text-md mr-2 text-green-600"></i>
            <Link href={`/forums/${postData.forum}`} legacybehaviour><p className="text-md">
                Forum: <span className="text-green-600 font-medium">{postData.forum}</span>
            </p></Link>
        </div>
        <div className="flex items-center">
            <i className="fas fa-user text-md mr-2 text-blue-600"></i>
            <p className="text-md">
                Posted by: <span className="text-blue-600 font-medium">{postData.user}</span>
            </p>
        </div>
    </div>
</div>



    {/* Main Content Card */}
    <div className="mt-6 bg-gray-800 p-6 rounded-lg mb-4">
        {/* Post Title */}
        <h1 className="text-2xl font-extrabold mb-4">{postData.title}</h1>

        {/* Post Description */}
        <p className="text-sm text-gray-300 bg-slate-900 p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: postData.desc }}></p>
    </div>

<div className="mt-8 flex items-center justify-center">
    <hr className="border-gray-700 flex-grow mr-2" />
    <span className="text-sm font-light text-gray-500">Discussion</span>
    <hr className="border-gray-700 flex-grow ml-2" />
</div>


    {/* Replies Section */}
    <div className="space-y-4">
    {replyData && replyData.map((reply, index) => (
        <div key={index} className="reply-card bg-gray-800 px-4 py-3 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center mb-2">
                <h3 className="text-md text-blue-500 font-medium">{reply.user}</h3>
            </div>
            <p className="text-sm text-gray-300">{reply.msg}</p>
            {nestedReplies[reply.replyId] && nestedReplies[reply.replyId].map((nestedReply, nestedIndex) => (
                <div key={nestedIndex} className="nested-reply mt-3 pl-4 border-l-2 border-blue-500">
                    <div className="flex items-center mb-1">
                        <h4 className="text-sm text-blue-400 font-medium">{nestedReply.user}</h4>
                    </div>
                    <p className="text-xs text-gray-300">{nestedReply.msg}</p>
                </div>
            ))}
        </div>
    ))}
</div>

</div>
)};
export default ForumPage;
