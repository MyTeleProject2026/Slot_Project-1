import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { gameService } from '../services/gameService';
import toast from 'react-hot-toast';

const GameContext = createContext();

export const useGames = () => {
  const context = useContext(GameContext);
  if (!context) {
    // Return safe defaults if context is not available
    return {
      games: [],
      providers: [],
      categories: [],
      loading: false,
      favorites: [],
      activeGame: null,
      fetchGames: async () => [],
      fetchProviders: async () => [],
      searchGames: async () => [],
      getGamesByProvider: async () => [],
      getGamesByCategory: async () => [],
      startGame: async () => null,
      spin: async () => null,
      collectWin: async () => null,
      toggleFavorite: () => {},
      isFavorite: () => false,
      setActiveGame: () => {},
    };
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { isAuthenticated, api } = useAuth();
  const [games, setGames] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [activeGame, setActiveGame] = useState(null);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'slots', name: 'Slots', icon: '🎰' },
    { id: 'live', name: 'Live Casino', icon: '🎲' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'fishing', name: 'Fishing', icon: '🎣' },
    { id: 'lotto', name: 'Lotto', icon: '🎱' },
  ];

  const fetchGames = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await gameService.getGames(api, params);
      const gamesData = data.games || [];
      setGames(gamesData);
      return gamesData;
    } catch (error) {
      console.error('Fetch games error:', error);
      setError('Failed to load games. Please refresh.');
      toast.error('Failed to load games');
      setGames([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const data = await gameService.getProviders(api);
      setProviders(data.providers || []);
      return data.providers;
    } catch (error) {
      console.error('Fetch providers error:', error);
      return [];
    }
  };

  const searchGames = async (query) => {
    if (!query.trim()) return fetchGames();
    setLoading(true);
    try {
      const data = await gameService.searchGames(api, query);
      setGames(data.games || []);
      return data.games;
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getGamesByProvider = async (provider) => {
    setLoading(true);
    try {
      const data = await gameService.getGamesByProvider(api, provider);
      setGames(data.games || []);
      return data.games;
    } catch (error) {
      console.error('Get by provider error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getGamesByCategory = async (category) => {
    setLoading(true);
    try {
      const data = await gameService.getGamesByCategory(api, category);
      setGames(data.games || []);
      return data.games;
    } catch (error) {
      console.error('Get by category error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const startGame = async (gameId, betAmount = 1, selectedLines = 20) => {
    if (!isAuthenticated) {
      toast.error('Please login to play');
      return null;
    }
    try {
      const data = await gameService.startGame(api, { gameId, betAmount, selectedLines });
      setActiveGame(data.session);
      return data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start game');
      return null;
    }
  };

  const spin = async (sessionId, betAmount, selectedLines) => {
    try {
      const data = await gameService.spin(api, { sessionId, betAmount, selectedLines });
      return data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Spin failed');
      throw error;
    }
  };

  const collectWin = async (sessionId) => {
    try {
      const data = await gameService.collectWin(api, { sessionId });
      return data;
    } catch (error) {
      console.error('Collect win error:', error);
      return null;
    }
  };

  const toggleFavorite = (gameId) => {
    setFavorites(prev => {
      const updated = prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId];
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (gameId) => favorites.includes(gameId);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      try { setFavorites(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchGames();
    fetchProviders();
  }, []);

  const value = {
    games,
    providers,
    categories,
    loading,
    favorites,
    activeGame,
    error,
    fetchGames,
    fetchProviders,
    searchGames,
    getGamesByProvider,
    getGamesByCategory,
    startGame,
    spin,
    collectWin,
    toggleFavorite,
    isFavorite,
    setActiveGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameContext;
