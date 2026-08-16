import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaShieldAlt, FaEdit, FaSave, FaTimes, FaUserCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-dark-700/50 text-center">
          <FaUserCircle className="text-5xl md:text-6xl text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Profile</h2>
          <p className="text-gray-400 mb-6">Please login to view your profile</p>
          <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all inline-block">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-4 md:mb-6">My Profile</h1>

        <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-dark-700/50 shadow-xl">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-primary-500 to-orange-500 flex items-center justify-center text-2xl md:text-3xl font-bold text-dark-900 shadow-lg shadow-primary-500/25">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">{user.fullName || user.username}</h2>
              <p className="text-gray-400">@{user.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Active</span>
                <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full">{user.role || 'User'}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username (read-only) */}
            <div className="bg-dark-700/50 rounded-xl p-3">
              <label className="text-xs text-gray-400">Username</label>
              <p className="text-white font-medium">{user.username}</p>
            </div>

            {/* Email (read-only) */}
            <div className="bg-dark-700/50 rounded-xl p-3">
              <label className="text-xs text-gray-400">Email</label>
              <p className="text-white font-medium">{user.email}</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 bg-dark-700/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    isEditing 
                      ? 'border-primary-500 focus:ring-primary-500/20' 
                      : 'border-dark-600 cursor-not-allowed opacity-70'
                  }`}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 bg-dark-700/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    isEditing 
                      ? 'border-primary-500 focus:ring-primary-500/20' 
                      : 'border-dark-600 cursor-not-allowed opacity-70'
                  }`}
                />
              </div>
            </div>

            {/* Joined Date */}
            <div className="bg-dark-700/50 rounded-xl p-3">
              <label className="text-xs text-gray-400">Joined</label>
              <p className="text-white font-medium flex items-center gap-2">
                <FaCalendarAlt className="text-primary-500 text-xs" />
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-dark-700/50">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <FaEdit /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Saving...</>
                    ) : (
                      <><FaSave /> Save Changes</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-dark-700 text-white rounded-xl font-semibold hover:bg-dark-600 transition flex items-center gap-2"
                  >
                    <FaTimes /> Cancel
                  </button>
                </>
              )}
            </div>

            <Link 
              to="/settings" 
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary-500 transition justify-center"
            >
              <FaShieldAlt /> Change Password
            </Link>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
