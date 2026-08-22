import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaHeadset, FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const Support = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Mock messages - replace with actual API/Socket connection
    if (isAuthenticated) {
      setMessages([
        {
          id: 1,
          text: 'Welcome to support! How can we help you today?',
          isAdmin: true,
          timestamp: new Date().toISOString(),
        },
      ]);
      setIsConnected(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      isAdmin: false,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');

    // Mock auto-reply - replace with actual API
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: 'Thank you for your message. Our team will get back to you shortly.',
          isAdmin: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-dark-700/50 text-center">
          <FaHeadset className="text-5xl md:text-6xl text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('support.title')}</h2>
          <p className="text-gray-400 mb-6">{t('profile.loginRequired')}</p>
          <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all inline-block">
            {t('nav.login')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-dark-700/50 bg-dark-900/50">
          <div className="flex items-center gap-3">
            <FaHeadset className="text-2xl text-primary-500" />
            <div>
              <h2 className="text-lg font-bold text-white">{t('support.title')}</h2>
              <p className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? t('support.connected') : t('support.disconnected')}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>{t('support.noMessages')}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] flex ${msg.isAdmin ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
                  {msg.isAdmin && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-orange-500 flex items-center justify-center text-dark-900 font-bold text-sm flex-shrink-0">
                      <FaHeadset className="text-xs" />
                    </div>
                  )}
                  {!msg.isAdmin && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-orange-500 flex items-center justify-center text-dark-900 font-bold text-sm flex-shrink-0">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-xl ${
                      msg.isAdmin
                        ? 'bg-dark-700/80 text-white rounded-tl-none'
                        : 'bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-tr-none'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.text}</p>
                    <p className="text-[10px] opacity-50 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-dark-700/50 bg-dark-900/30">
          <div className="flex items-center gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('support.typeMessage')}
              className="flex-1 px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Support;
