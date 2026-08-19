import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaArrowLeft, FaCoins, FaDice } from 'react-icons/fa';
import toast from 'react-hot-toast';

// ✅ FIXED: Get RTP (last value in array)
const getRtpDisplay = (game) => {
  if (game.rtpOverride) return game.rtpOverride.toFixed(2);
  if (game.rtp && Array.isArray(game.rtp) && game.rtp.length > 0) {
    return game.rtp[game.rtp.length - 1].toFixed(2);
  }
  if (typeof game.rtp === 'number') return game.rtp.toFixed(2);
  return 'N/A';
};

const Play = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { games, loading, startGame, spin, collectWin } = useGames();
  const { balance, refreshBalance } = useWallet();

  const [game, setGame] = useState(null);
  const [session, setSession] = useState(null);
  const [bet, setBet] = useState(1);
  const [spinResult, setSpinResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameError, setGameError] = useState(null);
  const [startError, setStartError] = useState(null);

  // Find the game from the list
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to play');
      navigate('/login');
      return;
    }

    if (games && games.length > 0) {
      const decodedGameId = decodeURIComponent(gameId);
      const found = games.find(g => g.id === decodedGameId);
      if (found) {
        setGame(found);
        setStartError(null);
      } else {
        setGameError('Game not found');
        toast.error('Game not found');
        navigate('/games');
      }
    }
  }, [games, gameId, navigate, isAuthenticated]);

  // Auto-start game when game is loaded
  useEffect(() => {
    if (game && !session && !isPlaying && !startError) {
      handleStartGame();
    }
  }, [game]);

  const handleStartGame = async () => {
    if (!game || isPlaying) return;
    setIsPlaying(true);
    setStartError(null);
    try {
      const result = await startGame(game.id, bet, 20);
      if (result && result.success !== false) {
        setSession(result.session || result);
        setSpinResult(null);
        await refreshBalance();
        toast.success('Game started!');
      } else {
        const errorMsg = result?.error || 'Failed to start game';
        setStartError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Start game error:', error);
      const msg = error.response?.data?.error || error.message || 'Failed to start game';
      setStartError(msg);
      toast.error(msg);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSpin = async () => {
    if (!session || isPlaying) return;
    setIsPlaying(true);
    try {
      const sessionId = session.sessionId || session.gid || session.id;
      if (!sessionId) {
        toast.error('Invalid session');
        return;
      }
      const result = await spin(sessionId, bet, 20);
      if (result && result.success !== false) {
        setSpinResult(result.result || result);
        await refreshBalance();
        const gain = result.result?.gain || result.gain || 0;
        if (gain > 0) {
          toast.success(`🎉 You won ${gain.toFixed(2)}!`);
        }
      } else {
        toast.error(result?.error || 'Spin failed');
      }
    } catch (error) {
      console.error('Spin error:', error);
      toast.error(error.response?.data?.error || 'Spin failed');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleCollect = async () => {
    if (!session) return;
    try {
      const sessionId = session.sessionId || session.gid || session.id;
      if (!sessionId) {
        toast.error('Invalid session');
        return;
      }
      const result = await collectWin(sessionId);
      if (result && result.success !== false) {
        await refreshBalance();
        setSpinResult(null);
        toast.success('Collected!');
      } else {
        toast.error(result?.error || 'Collect failed');
      }
    } catch (error) {
      console.error('Collect error:', error);
      toast.error('Collect failed');
    }
  };

  if (loading || !game) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (gameError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-gray-400">
          <p className="text-xl">{gameError}</p>
          <button onClick={() => navigate('/games')} className="mt-4 px-6 py-2 bg-primary-500 text-dark-900 rounded-lg hover:bg-primary-400 transition">
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  const displayName = game.name || 'Game';
  const displayProvider = game.provider || 'Unknown Provider';
  const currentBalance = balance?.main || 0;
  const rtpDisplay = getRtpDisplay(game);

  return (
    <div className="container mx-auto px-4 py-6">
      <button
        onClick={() => navigate('/games')}
        className="text-gray-400 hover:text-white transition flex items-center gap-2 mb-4"
      >
        <FaArrowLeft /> Back to Games
      </button>

      <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/30 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <span className="text-sm text-gray-400">{displayProvider}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-900/50 rounded-xl">
            <FaCoins className="text-yellow-500" />
            <span className="text-white font-semibold">
              {currentBalance.toFixed(2)}
            </span>
          </div>
        </div>

        {startError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm flex items-center gap-2">
            <span>⚠️ {startError}</span>
            <button
              onClick={handleStartGame}
              className="ml-auto px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-dark-900/50 rounded-xl p-4 md:p-6 mb-4 min-h-[250px] flex items-center justify-center">
          {spinResult ? (
            <div className="text-center w-full">
              <div className="text-6xl mb-4">🎰</div>
              <div className="text-3xl font-bold text-primary-500">
                {spinResult.gain > 0 ? `+${spinResult.gain.toFixed(2)}` : 'Try Again'}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                {spinResult.game?.reels ? (
                  <div className="flex justify-center gap-2">
                    {spinResult.game.reels.map((reel, i) => (
                      <div key={i} className="flex flex-col gap-1 bg-dark-800 p-2 rounded-lg">
                        {reel.map((symbol, j) => (
                          <div key={j} className="w-8 h-8 bg-dark-700 rounded flex items-center justify-center text-lg">
                            {symbol}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  'Spin complete'
                )}
              </div>
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  onClick={handleSpin}
                  disabled={isPlaying}
                  className="px-6 py-2 bg-primary-500 text-dark-900 rounded-lg font-semibold hover:bg-primary-400 transition disabled:opacity-50"
                >
                  {isPlaying ? 'Spinning...' : 'Spin Again'}
                </button>
                <button
                  onClick={handleCollect}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-400 transition"
                >
                  Collect
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <span className="text-6xl block mb-3">🎰</span>
              <p className="text-lg">{isPlaying ? 'Starting game...' : 'Loading game...'}</p>
              {session && !startError && (
                <button
                  onClick={handleSpin}
                  disabled={isPlaying}
                  className="mt-4 px-6 py-2 bg-primary-500 text-dark-900 rounded-lg font-semibold hover:bg-primary-400 transition disabled:opacity-50"
                >
                  <FaDice className="inline mr-2" /> Spin
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">Bet:</label>
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
              min="0.1"
              step="0.1"
              className="w-24 bg-dark-900 text-white rounded-lg px-3 py-2 border border-dark-700 focus:outline-none focus:border-primary-500"
            />
          </div>

          {!session && !spinResult && (
            <button
              onClick={handleStartGame}
              disabled={isPlaying}
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-dark text-dark-900 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {isPlaying ? 'Starting...' : 'Start Game'}
            </button>
          )}

          {session && !spinResult && (
            <button
              onClick={handleSpin}
              disabled={isPlaying}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {isPlaying ? 'Spinning...' : 'Spin'}
            </button>
          )}

          <div className="text-sm text-gray-500 ml-auto">
            Lines: 20
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 border-t border-dark-700/50 pt-4 flex flex-wrap gap-4">
          <span>RTP: {rtpDisplay}%</span>
          <span>Provider: {displayProvider}</span>
          <span>Game ID: {game.id}</span>
        </div>
      </div>
    </div>
  );
};

export default Play;
