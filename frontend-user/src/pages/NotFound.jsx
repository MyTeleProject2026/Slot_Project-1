import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-8xl font-bold text-primary-500">404</h1>
      <h2 className="text-2xl font-bold text-white mt-4">Page Not Found</h2>
      <p className="text-gray-400 mt-2 text-center">Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6 px-6 py-3 bg-primary-500 text-dark-900 rounded-lg font-semibold hover:bg-primary-400 transition flex items-center gap-2">
        <FaHome /> Go Home
      </Link>
    </div>
  );
};

export default NotFound;