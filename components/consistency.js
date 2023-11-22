import React from 'react';
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="py-4 bg-slate-800 text-center text-xs text-gray-500">
            © 2023 GPT Reddit. All rights reserved.
        </footer>
    );
};


export const TopBar = ({ children }) => {
    return (
        <div className="fixed top-0 left-0 w-full bg-gray-800 px-4 py-2 shadow z-50">
            <div className="container mx-auto flex justify-between items-center">
                {children}
            </div>
        </div>
    );
};


