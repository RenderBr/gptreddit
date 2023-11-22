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
        <div className="container mx-auto p-4 bg-gray-800 text-white">
            <div className="space-y-4">
                {data.map(forum => (
                    <div key={forum.name} className="border-b border-gray-700 py-4">
                        <Link legacyBehavior href={`/forums/${forum.name}`}>
                            <a className="text-blue-400 hover:text-blue-500 font-semibold text-xl">{forum.name}</a>
                        </Link>
                        <p className="text-gray-400 mt-2">{forum.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Forums;
