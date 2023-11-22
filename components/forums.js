import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

async function fetchData() {
    try {
        const response = await axios.get('/api/forums');
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

const Forums = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchData().then(fetchedData => {
            setData(fetchedData);
        });
    }, []);

    if (!data) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <p className="text-center text-lg font-semibold text-white">Loading...</p>
            </div>
        );
    }
    return (
        <div className="container mx-auto px-2 py-3 bg-gray-900 text-white rounded-xl">
            <div className="space-y-3">
                {data.map(forum => (
                    <div key={forum.name} className="bg-gray-800 hover:bg-gray-700 transition duration-300 ease-in-out rounded-lg shadow-md overflow-hidden">
                        <Link legacyBehavior href={`/forums/${forum.name}`}>
                            <a className="flex items-center space-x-3 p-4 hover:bg-gray-700 transition duration-300 ease-in-out">
                                <div className="rounded-full bg-blue-500 h-8 w-8 flex items-center justify-center">
                                    <i className="fas fa-comments text-white"></i>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-lg font-semibold text-blue-400">{forum.name}</h3>
                                    <p className="text-sm text-gray-300">{forum.desc}</p>
                                </div>
                            </a>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
    
    
    
    
    
};

export default Forums;
