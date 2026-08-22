import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaBell, FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminNavbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-dark-900/95 backdrop-blur-xl border-b border-dark-800/50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-white hover:text-primary-500 transition"
            >
              <FaBars className="text-xl" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold gradient-text">Super Admin</span>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-white transition relative">
              <FaBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800/80 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-orange-500 flex items-center justify-center text-dark-900 font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="hidden md:block text-sm font-medium text-white">
                  {user?.username}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-dark-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-dark-700/50 py-1 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-dark-700/50">
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                    <p className="text-xs text-primary-500 mt-1">{user?.role}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-700/50 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaUserCircle /> <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings/general"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-700/50 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaCog /> <span>Settings</span>
                  </Link>
                  <hr className="border-dark-700/50 my-1" />
                  <button
                    onClick={() => { logout(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-red-500/10 transition text-red-400"
                  >
                    <FaSignOutAlt /> <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
