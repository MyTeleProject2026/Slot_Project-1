import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaPhone, FaLock, FaUserCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.identifier.trim()) next.identifier = 'Phone number is required';
    if (!form.password) next.password = 'Password is required';
    if (Object.keys(next).length) { setErrors(next); return; }
    setLoading(true);
    try {
      await login(form.identifier, form.password);
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-8">
          <div className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-500 to-orange-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <FaUserCircle className="text-3xl md:text-4xl text-dark-900" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in with your phone number</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-dark-700/50 shadow-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="tel" name="identifier" value={form.identifier} onChange={handleChange} placeholder="09xxxxxxxxx" autoComplete="tel" className={`w-full pl-10 pr-4 py-3 bg-dark-700/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.identifier ? 'border-red-500 focus:ring-red-500/20' : 'border-dark-600 focus:ring-primary-500/20 focus:border-primary-500'}`} />
            </div>
            {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" autoComplete="current-password" className={`w-full pl-10 pr-12 py-3 bg-dark-700/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-dark-600 focus:ring-primary-500/20 focus:border-primary-500'}`} />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-400"><input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500/20" />Remember me</label>
            <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-400">Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><span className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-400 mt-2">Don't have an account? <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium">Register here</Link></p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
