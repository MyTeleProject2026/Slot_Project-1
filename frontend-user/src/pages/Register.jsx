import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaPhone, FaUserCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Username is required';
    else if (form.username.length < 3) newErrors.username = 'Minimum 3 characters';
    else if (form.username.length > 20) newErrors.username = 'Maximum 20 characters';

    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';

    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Minimum 8 characters';
    else if (!/(?=.*[A-Z])/.test(form.password)) newErrors.password = 'Must contain at least one uppercase letter';
    else if (!/(?=.*[a-z])/.test(form.password)) newErrors.password = 'Must contain at least one lowercase letter';
    else if (!/(?=.*\d)/.test(form.password)) newErrors.password = 'Must contain at least one number';

    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';

    if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(form);
      // AuthContext shows toast on success
      navigate('/');
    } catch (error) {
      // Error message already shown in AuthContext
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-dark-950">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-500 to-orange-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <FaUserCircle className="text-4xl text-dark-900" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join the fun and start winning!</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 shadow-2xl space-y-4"
        >
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className={`w-full pl-10 pr-4 py-3 bg-dark-700/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm ${
                  errors.username
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-dark-600 focus:ring-primary-500/20 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={`w-full pl-10 pr-4 py-3 bg-dark-700/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-dark-600 focus:ring-primary-500/20 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              className={`w-full px-4 py-3 bg-dark-700/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm ${
                errors.fullName
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-dark-600 focus:ring-primary-500/20 focus:border-primary-500'
              }`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Phone (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone (optional)</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="w-full pl-10 pr-4 py-3 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={`w-full pl-10 pr-12 py-3 bg-dark-700/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-dark-600 focus:ring-primary-500/20 focus:border-primary-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500/20"
            />
            <label className="text-sm text-gray-400">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-500 hover:text-primary-400">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-500 hover:text-primary-400">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></span>
                Creating...
              </>
            ) : (
              'Register'
            )}
          </button>

          <p className="text-center text-sm text-gray-400 mt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium transition">
              Sign In
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
