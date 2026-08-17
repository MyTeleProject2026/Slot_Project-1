import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSave, FaGamepad } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const GameControl = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getGames, updateGameRTP, updateGameWinRate } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(null);
  const [rtpValue, setRtpValue] = useState('');
  const [winRateValue, setWinRateValue] = useState('');

  useEffect(() => {
    loadGame();
  }, [id]);

  const loadGame = async () => {
    setLoading(true);
    try {
      const data = await getGames({ id });
      const foundGame = data.games?.find(g => g.id === parseInt(id));
      if (foundGame) {
        setGame(foundGame);
        setRtpValue(foundGame.rtp || '');
        setWinRateValue(foundGame.win_rate || '');
      }
    } catch (error) {
      console.error('Failed to load game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRTPUpdate = async (e) => {
    e.preventDefault();
    const value = parseFloat(rtpValue);
    if (isNaN(value) || value < 0 || value > 100) {
      toast.error('Please enter a valid RTP (0-100)');
      return;
    }
    setLoading(true);
    try {
      await updateGameRTP(id, value);
      toast.success('RTP updated successfully!');
      loadGame();
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleWinRateUpdate = async (e) => {
    e.preventDefault();
    const value = parseFloat(winRateValue);
    if (isNaN(value) || value < 0 || value > 100) {
      toast.error('Please enter a valid win rate (0-100)');
      return;
    }
    setLoading(true);
    try {
      await updateGameWinRate(id, value);
      toast.success('Win rate updated successfully!');
      loadGame();
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!game) return <div className="text-center text-gray-400 py-12">Game not found</div>;

  return (
    <div className="w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/games')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <FaArrowLeft /> Back to Games
        </button>

        <div className="flex items-center gap-3 mb-6">
          <FaGamepad className="text-2xl text-primary-500" />
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Game Control</h1>
        </div>

        <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 mb-6">
          <h3 className="text-lg font-bold text-white mb-2">{game.name}</h3>
          <p className="text-gray-400">Provider: {game.provider_name}</p>
          <p className="text-gray-400">Category: {game.category}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs ${
              game.status === 'active' ? 'bg-green-500/20 text-green-400' :
              game.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {game.status}
            </span>
            <span className="text-xs text-gray-400">RTP: {game.rtp}%</span>
          </div>
        </div>

        {/* RTP Control */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">RTP Control</h3>
          <p className="text-sm text-gray-400 mb-4">
            Current RTP: <span className="text-primary-500 font-bold">{game.rtp}%</span>
          </p>
          <form onSubmit={handleRTPUpdate} className="flex gap-3">
            <input
              type="number"
              value={rtpValue}
              onChange={(e) => setRtpValue(e.target.value)}
              placeholder="Enter RTP (0-100)"
              step="0.01"
              min="0"
              max="100"
              className="flex-1 px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition flex items-center gap-2"
            >
              <FaSave /> Update RTP
            </button>
          </form>
        </div>

        {/* Win Rate Control */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50">
          <h3 className="text-lg font-bold text-white mb-4">Win Rate Control</h3>
          <p className="text-sm text-gray-400 mb-4">
            Current Win Rate: <span className="text-green-500 font-bold">{game.win_rate || 'N/A'}%</span>
          </p>
          <form onSubmit={handleWinRateUpdate} className="flex gap-3">
            <input
              type="number"
              value={winRateValue}
              onChange={(e) => setWinRateValue(e.target.value)}
              placeholder="Enter Win Rate (0-100)"
              step="0.01"
              min="0"
              max="100"
              className="flex-1 px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition flex items-center gap-2"
            >
              <FaSave /> Update Win Rate
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default GameControl;
