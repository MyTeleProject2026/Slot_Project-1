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
