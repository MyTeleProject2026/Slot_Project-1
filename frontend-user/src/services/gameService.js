import api from './api';

const cache = new Map();
const CACHE_DURATION = 60000;
const getCacheKey = (endpoint, params = {}) => `${endpoint}:${JSON.stringify(params)}`;
const getCachedData = (key) => {
  const cached = cache.get(key);
  return cached && Date.now() - cached.timestamp < CACHE_DURATION ? cached.data : null;
};
const setCachedData = (key, data) => cache.set(key, { data, timestamp: Date.now() });
export const clearCache = () => cache.clear();

export const gameService = {
  // Player-facing catalogue is club-scoped. The backend resolves the
  // authenticated user's N999Bet club and only returns games enabled by
  // Slotopol Admin for that club.
  getGames: async (params = {}) => {
    const cacheKey = getCacheKey('/games/available', params);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    try {
      const response = await api.get('/games/available', { params });
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      const stale = cache.get(cacheKey);
      if (stale) return stale.data;
      throw error;
    }
  },

  getGameById: async (id) => {
    if (!id) throw new Error('Game ID is required');
    const response = await api.get(`/games/${encodeURIComponent(id)}`);
    return response.data;
  },

  getProviders: async () => {
    const response = await api.get('/games/providers');
    return response.data;
  },

  searchGames: async (query) => gameService.getGames(query?.trim() ? { search: query.trim() } : {}),
  getGamesByProvider: async (provider) => gameService.getGames(provider ? { provider } : {}),
  getGamesByCategory: async (category) => gameService.getGames(category ? { category } : {}),
  getHotGames: async () => gameService.getGames({ hot: 'true' }),
  getNewGames: async () => gameService.getGames({ new: 'true' }),

  startGame: async (data) => {
    if (!data || typeof data !== 'object') throw new Error('Game data is required');
    const response = await api.post('/games/start', data);
    return response.data;
  },
  spin: async (data) => {
    if (!data || typeof data !== 'object') throw new Error('Spin data is required');
    const response = await api.post('/games/spin', data);
    return response.data;
  },
  collectWin: async (data) => {
    if (!data || typeof data !== 'object') throw new Error('Collect data is required');
    const response = await api.post('/games/collect', data);
    return response.data;
  },
};

export default gameService;
