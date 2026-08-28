import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaPhone, FaUserCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    const username = form.username.trim();
    const phone = form.phone.trim();
    if (!username) next.username = 'Username is required';
    else if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) next.username = 'Username must be 3-20 letters, numbers, or underscores';
    if (!phone) next.phone = 'Phone number is required';
    else if (!/^(?:\+?95|0)?9\d{7,9}$/.test(phone.replace(/[\s()-]/g, ''))) next.phone = 'Enter a valid Myanmar phone number';
    if (!form.password) next.password = 'Password is required';
    else if (form.password.length < 8) next.password = 'Minimum 8 characters';
    else if (!/[A-Z]/.test(form.password)) next.password = 'Must contain an uppercase letter';
    else if (!/[a-z]/.test(form.password)) next.password = 'Must contain a lowercase letter';
    else if (!/\d/.test(form.password)) next.password = 'Must contain a number';
    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) next.agreeTerms = 'You must agree to the terms';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ username: form.username.trim(), phone: form.phone.trim(), password: form.password, confirmPassword: form.confirmPassword });
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
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
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Register with your Myanmar phone number</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-dark-700/50 shadow-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="09xxxxxxxxx" autoComplete="tel" className={`w-full pl-10 pr-4 py-3 bg-dark-700/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-dark-600 focus:ring-primary-500/20 focus:border-primary-500'}`} />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Choose a username" autoComplete="username" className={`w-full pl-10 pr-4 py-3 bg-dark-700/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.username ? 'border-red-500 focus:ring-red-500/20' : 'border-dark-600 focus:ring-primary-500/20 focus:border-primary-500'}`} />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Create a password" autoComplete="new-password" className={`w-full pl-10 pr-12 py-3 bg-dark-700/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-dark-600 focus:ring-primary-500/20 focus:border-primary-500'}`} />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Enter your password again" autoComplete="new-password" className={`w-full pl-10 pr-12 py-3 bg-dark-700/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-dark-600 focus:ring-primary-500/20 focus:border-primary-500'}`} />
              <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500/20" />
            <label className="text-sm text-gray-400">I agree to the <Link to="/terms" className="text-primary-500 hover:text-primary-400">Terms of Service</Link> and <Link to="/privacy" className="text-primary-500 hover:text-primary-400">Privacy Policy</Link></label>
          </div>
          {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms}</p>}

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><span className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" /> Creating...</> : 'Register'}
          </button>

          <p className="text-center text-sm text-gray-400 mt-2">Already have an account? <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium">Sign In</Link></p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
