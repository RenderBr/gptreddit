// pages/forum/[slug].js
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {Footer, TopBar} from '../../components/consistency.js';

// Define a function to handle the API request
const handleAddPost = async (chosenForum, setPostData, setIsLoading) => {
    try {
        setIsLoading(true)
      // Perform your API request here
      const response = await axios.get(`/api/ai/createPost?chosenForum=${chosenForum}`);

      const newPost = response.data; // Modify this based on your API response structure
      setPostData((prevPosts) => [newPost, ...prevPosts]);
      window.scrollTo(0, 0); // Scrolls to the top of the page
    } catch (error) {
      // Handle any network or API request error here
      console.error('Error creating a new post:', error);
    }finally{
        setIsLoading(false)
    }
  };
  

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
    const [isLoading, setIsLoading] = useState(false);

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
<div className="bg-gray-900 text-white flex flex-col min-h-screen">
    {/* Top Bar */}
    <TopBar>
    <Link legacyBehavior href={`/`}>
                <a className="flex items-center text-blue-500 hover:text-blue-400 transition-colors">
                    <i className="fas fa-chevron-left text-md mr-2"></i>
                    <span className="text-sm font-medium">Go back home</span>
                </a>
            </Link>
            <p className="text-xs text-gray-400">{forumData.desc}</p>
            {/* Add Post Button */}
        <button
          onClick={() => handleAddPost(forumData.name, setPostData, setIsLoading)}
          className="text-white bg-blue-500 hover:bg-blue-600 rounded-md px-3 py-1 text-sm"
          disabled={isLoading}
        >
          {isLoading ? 'Working on that...' : 'Add Post'}
        </button>
    </TopBar>

    
    {/* Main Content */}
    <div className="container mx-auto pt-16 pb-8 px-4 flex-grow">
        <div className="bg-gray-800 rounded-lg shadow px-5 py-4 mb-5">
            <h1 className="text-2xl font-bold text-blue-500 mb-2">{forumData.name}</h1>
            <p className="text-sm text-gray-400">{forumData.desc}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {postData.map(post => (
                <Link legacyBehavior key={post.title} href={`/posts/${post.id}`}>
                    <a className={`bg-gray-800 hover:bg-gray-700 rounded-md shadow-md hover:shadow-lg transition duration-200 ease-in-out p-3 post-fade-in`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-md font-semibold text-gray-300 truncate">{post.title}</h2>
                            <span className="text-xs text-gray-400 ml-2">{post.commentCount} <i className="fas fa-comment-alt"></i></span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">{post.user}</div>
                        <p className="text-xs text-gray-300 mt-1 line-clamp-2">{post.content}</p>
                    </a>
                </Link>
            ))}
        </div>
    </div>
    <Footer />
</div>



    
    )};
    
    
                    
export default ForumPage;
