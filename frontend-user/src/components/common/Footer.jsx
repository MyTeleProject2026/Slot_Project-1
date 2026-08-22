import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube, FaTelegram, FaWhatsapp } from 'react-icons/fa';
import { APP_NAME } from '../../utils/constants';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-dark-900 border-t border-dark-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-primary-500 mb-4">{APP_NAME}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Your trusted online gaming platform. Play safe, win big.</p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition"><FaFacebook className="text-xl" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition"><FaInstagram className="text-xl" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition"><FaYoutube className="text-xl" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition"><FaTelegram className="text-xl" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition"><FaWhatsapp className="text-xl" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/games" className="text-gray-400 hover:text-primary-500 text-sm transition">Games</Link></li>
              <li><Link to="/promotions" className="text-gray-400 hover:text-primary-500 text-sm transition">Promotions</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-primary-500 text-sm transition">About</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-primary-500 text-sm transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-400 hover:text-primary-500 text-sm transition">FAQ</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-primary-500 text-sm transition">Terms</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-primary-500 text-sm transition">Privacy</Link></li>
              <li><Link to="/responsible-gaming" className="text-gray-400 hover:text-primary-500 text-sm transition">Responsible Gaming</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 support@n999bet.com</li>
              <li>💬 24/7 Live Chat</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© {year} {APP_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span>18+</span>
            <span>|</span>
            <span>🔒 Secure Gaming</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
