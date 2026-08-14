import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.username) newErrors.username = 'Username is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/logo.png" alt="FattBet" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to continue playing</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl p-6 shadow-xl">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Enter your username" className={`w-full px-4 py-3 bg-dark-700 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition ${errors.username ? 'border-red-500 focus:ring-red-500/20' : 'border-dark-600 focus:ring-primary-500/20'}`} />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" className={`w-full px-4 py-3 bg-dark-700 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition pr-12 ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-dark-600 focus:ring-primary-500/20'}`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input type="checkbox" className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500/20" /> Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-400 transition">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary-500 text-dark-900 font-bold rounded-xl hover:bg-primary-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><span className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></span> Signing in...</> : 'Sign In'}
          </button>
          <p className="text-center text-sm text-gray-400 mt-4">Don't have an account? <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium transition">Register here</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Login;