// pages/forum/[slug].js
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

async function fetchForumData(slug) {
    try {
        const response = await axios.get(`/api/forum/${slug}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};

async function fetchPosts(slug) {
    try {
        const response = await axios.get(`/api/forum/posts/${slug}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};

const ForumPage = () => {
    const router = useRouter();
    const { slug } = router.query;
    const [forumData, setForumData] = useState(null);
    const [postData, setPostData] = useState(null);

    useEffect(() => {
        if (slug) {
            fetchForumData(slug).then(setForumData);
            fetchPosts(slug).then(setPostData);
        }
    }, [slug]);

    if (!forumData || !postData) {
        return <div className="flex justify-center items-center h-screen bg-gray-900">
                   <p className="font-semibold text-lg text-white">Loading...</p>
               </div>;
    }
    return (
        <div className="bg-gray-900 text-white">
        {/* Top Bar */}
        <div className="fixed top-0 left-0 w-full bg-gray-800 px-3 py-2 mb-6 z-50">
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
                <i className="fas fa-users text-md mr-2 text-green-600"></i>
                <Link href={`/`} legacybehaviour><p className="text-md">
                    <span className="text-green-600 font-medium">Go back home</span>
                </p></Link>
            </div>
            <div className="flex items-center">
                <i className="fas fa-user text-md mr-2 text-blue-600"></i>
                <p className="text-sm">
                    <span className="text-gray-400 font-light">{forumData.desc}</span>
                </p>
            </div>
        </div>
    </div>
    
            {/* Main Content */}
            <div className="container mx-auto pt-16 p-4">
                <div className="bg-gray-800 p-5 pb-2 rounded-lg shadow-md">
                    <h1 className="text-3xl font-extrabold text-blue-500 mb-3">{forumData.name}</h1>
                    <p className="text-md text-gray-400 mb-4">{forumData.desc}</p>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {postData.map(post => (
                        <div key={post.title} className="bg-gray-800 p-4 rounded-lg hover:bg-slate-900 transition-colors">
                            <Link legacyBehaviour href={`/posts/${post.id}`}>
                                <h2 className="text-xl font-semibold text-gray-400 hover:text-green-300 cursor-pointer mb-2">{post.title}</h2>
                            </Link>
                            <h3 className="text-sm text-gray-500 mb-2">{post.user}</h3>
                            <p className="text-sm text-gray-300 line-clamp-3">{post.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )};
    
    
                    
export default ForumPage;
