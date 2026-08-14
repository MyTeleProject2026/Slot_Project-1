import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username) newErrors.username = 'Username is required';
    else if (form.username.length < 3) newErrors.username = 'Minimum 3 characters';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Minimum 8 characters';
    if (!form.fullName) newErrors.fullName = 'Full name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/logo.png" alt="FattBet" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join the fun and start winning!</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Choose a username" className={`w-full px-4 py-3 bg-dark-700 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition ${errors.username ? 'border-red-500 focus:ring-red-500/20' : 'border-dark-600 focus:ring-primary-500/20'}`} />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className={`w-full px-4 py-3 bg-dark-700 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-dark-600 focus:ring-primary-500/20'}`} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" className={`w-full px-4 py-3 bg-dark-700 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition ${errors.fullName ? 'border-red-500 focus:ring-red-500/20' : 'border-dark-600 focus:ring-primary-500/20'}`} />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone (optional)</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Create a password" className={`w-full px-4 py-3 bg-dark-700 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition pr-12 ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-dark-600 focus:ring-primary-500/20'}`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary-500 text-dark-900 font-bold rounded-xl hover:bg-primary-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><span className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></span> Creating...</> : 'Create Account'}
          </button>
          <p className="text-center text-sm text-gray-400 mt-2">Already have an account? <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium transition">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Register;