import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUserCircle, FaPaperPlane, FaCheckCircle, FaClock, FaHeadset } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const SupportChat = () => {
  const { getSupportMessages, sendSupportReply, resolveSupportTicket } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await getSupportMessages();
      const allMessages = data.messages || [];
      setMessages(allMessages);
      
      // Extract unique users from messages
      const uniqueUsers = {};
      allMessages.forEach(msg => {
        if (msg.user_id && msg.user_name) {
          uniqueUsers[msg.user_id] = {
            id: msg.user_id,
            name: msg.user_name,
            lastMessage: msg.created_at,
            unread: !msg.is_read && !msg.is_from_user,
          };
        }
      });
      setUsers(Object.values(uniqueUsers));
      
      // Auto-select first user if available
      if (Object.keys(uniqueUsers).length > 0 && !selectedUser) {
        const firstUserId = Object.keys(uniqueUsers)[0];
        setSelectedUser(uniqueUsers[firstUserId]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedUser) return;
    setSending(true);
    try {
      await sendSupportReply(selectedUser.id, inputMessage.trim());
      setInputMessage('');
      loadMessages();
    } catch (error) {
      // Error handled in context
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async (messageId) => {
    if (window.confirm('Resolve this ticket?')) {
      try {
        await resolveSupportTicket(messageId);
        loadMessages();
      } catch (error) {
        // Error handled in context
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserMessages = (userId) => {
    return messages.filter(msg => msg.user_id === userId);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <FaHeadset className="text-2xl text-primary-500" />
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Support Chat</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Users List */}
          <div className="lg:col-span-1 bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/50 p-4 max-h-[600px] overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Conversations</h3>
            {users.length === 0 ? (
              <p className="text-gray-400 text-sm text-center">No conversations</p>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selectedUser?.id === user.id
                      ? 'bg-primary-500/20 border border-primary-500/30'
                      : 'hover:bg-dark-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaUserCircle className="text-2xl text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.lastMessage && new Date(user.lastMessage).toLocaleDateString()}</p>
                    </div>
                    {user.unread && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden flex flex-col h-[600px]">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-dark-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaUserCircle className="text-2xl text-gray-400" />
                    <div>
                      <p className="font-medium text-white">{selectedUser.name}</p>
                      <p className="text-xs text-gray-400">User ID: {selectedUser.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const userMessages = getUserMessages(selectedUser.id);
                      const lastMessage = userMessages[userMessages.length - 1];
                      if (lastMessage) handleResolve(lastMessage.id);
                    }}
                    className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition"
                  >
                    <FaCheckCircle className="inline mr-1" /> Resolve
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {getUserMessages(selectedUser.id).length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>No messages</p>
                    </div>
                  ) : (
                    getUserMessages(selectedUser.id).map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.is_from_user ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-xl ${
                            msg.is_from_user
                              ? 'bg-dark-700/80 text-white rounded-tl-none'
                              : 'bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-tr-none'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.message}</p>
                          <p className="text-[10px] opacity-50 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-dark-700/50">
                  <div className="flex items-center gap-2">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
                      rows="1"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || sending}
                      className="p-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <FaPaperPlane className="text-sm" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Select a conversation to start</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SupportChat;
