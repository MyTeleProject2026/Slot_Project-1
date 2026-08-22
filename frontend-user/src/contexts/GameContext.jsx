import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { gameService, clearCache } from '../services/gameService';
import toast from 'react-hot-toast';

const GameContext = createContext();

export const useGames = () => {
  const context = useContext(GameContext);
  if (!context) {
    return {
      games: [],
      providers: [],
      categories: [],
      loading: false,
      favorites: [],
      activeGame: null,
      error: null,
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
      clearCache: () => {},
    };
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [games, setGames] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [activeGame, setActiveGame] = useState(null);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const categories = [
    { id: 'slots', name: 'Slots', icon: '🎰' },
    { id: 'live', name: 'Live Casino', icon: '🎲' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'fishing', name: 'Fishing', icon: '🎣' },
    { id: 'lotto', name: 'Lotto', icon: '🎱' },
  ];

  const fetchGames = async (params = {}) => {
    if (isFetching) {
      console.log('⏳ Already fetching games, skipping duplicate call');
      return [];
    }
    setIsFetching(true);
    setLoading(true);
    setError(null);
    try {
      const data = await gameService.getGames(params);
      const gamesData = data?.games || [];
      setGames(gamesData);
      return gamesData;
    } catch (error) {
      console.error('Fetch games error:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError('Failed to load games. Please refresh.');
      }
      toast.error('Failed to load games');
      setGames([]);
      return [];
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const data = await gameService.getProviders();
      const providersData = data?.providers || [];
      setProviders(providersData);
      return providersData;
    } catch (error) {
      console.error('Fetch providers error:', error);
      setProviders([]);
      return [];
    }
  };

  const searchGames = async (query) => {
    if (!query?.trim()) return fetchGames();
    setLoading(true);
    try {
      const data = await gameService.searchGames(query);
      const gamesData = data?.games || [];
      setGames(gamesData);
      return gamesData;
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
      const data = await gameService.getGamesByProvider(provider);
      const gamesData = data?.games || [];
      setGames(gamesData);
      return gamesData;
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
      const data = await gameService.getGamesByCategory(category);
      const gamesData = data?.games || [];
      setGames(gamesData);
      return gamesData;
    } catch (error) {
      console.error('Get by category error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: startGame returns the full response and throws errors properly
  const startGame = async (gameId, betAmount = 1, selectedLines = 20) => {
    if (!isAuthenticated) {
      toast.error('Please login to play');
      return null;
    }
    try {
      const data = await gameService.startGame({ gameId, betAmount, selectedLines });
      setActiveGame(data?.session);
      return data; // return the whole response
    } catch (error) {
      console.error('Start game error:', error);
      const msg = error.response?.data?.error || 'Failed to start game';
      toast.error(msg);
      throw error;
    }
  };

  const spin = async (sessionId, betAmount, selectedLines) => {
    try {
      const data = await gameService.spin({ sessionId, betAmount, selectedLines });
      return data;
    } catch (error) {
      console.error('Spin error:', error);
      toast.error(error.response?.data?.error || 'Spin failed');
      throw error;
    }
  };

  const collectWin = async (sessionId) => {
    try {
      const data = await gameService.collectWin({ sessionId });
      return data;
    } catch (error) {
      console.error('Collect win error:', error);
      toast.error(error.response?.data?.error || 'Collect failed');
      throw error;
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

  const clearCache = () => {
    gameService.clearCache?.();
    console.log('🧹 Cache cleared from context');
  };

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      try { setFavorites(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        await fetchGames();
        await fetchProviders();
      }
    };
    loadData();
    return () => { mounted = false; };
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
    clearCache,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameContext;
