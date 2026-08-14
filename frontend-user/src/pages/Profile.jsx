import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <FaUser className="text-6xl text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Profile</h2>
        <p className="text-gray-400 mb-6">Please login to view your profile</p>
        <Link to="/login" className="px-6 py-3 bg-primary-500 text-dark-900 rounded-lg font-semibold hover:bg-primary-400 transition">Login Now</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto bg-dark-800 rounded-2xl p-6 border border-dark-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-orange-500 flex items-center justify-center text-3xl font-bold text-dark-900 flex-shrink-0">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user.fullName || user.username}</h1>
            <p className="text-gray-400">@{user.username}</p>
          </div>
          <Link to="/profile/edit" className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition">
            <FaEdit className="text-primary-500" />
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
            <FaUser className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Username</p>
              <p className="text-white">{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
            <FaEnvelope className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-white">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
            <FaPhone className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-white">{user.phone || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
            <FaCalendar className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Member Since</p>
              <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-dark-700">
          <Link to="/wallet" className="w-full py-2.5 bg-primary-500 text-dark-900 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-400 transition">
            Go to Wallet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;