import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <motion.div 
      className="min-h-[70vh] flex flex-col items-center justify-center px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-8xl font-bold gradient-text mb-4">404</div>
      <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-r from-primary-500/20 to-orange-500/20 flex items-center justify-center border border-primary-500/30">
        <FaSearch className="text-4xl text-primary-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mt-4">Page Not Found</h2>
      <p className="text-gray-400 mt-2 text-center max-w-sm">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="mt-6 px-8 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center gap-2 hover:scale-105"
      >
        <FaHome /> Go Home
      </Link>
    </motion.div>
  );
};

export default NotFound;
