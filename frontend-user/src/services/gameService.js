import api from './api';

// ============================================================
// CACHE SYSTEM
// ============================================================
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute in milliseconds

const getCacheKey = (endpoint, params = {}) => {
  return `${endpoint}:${JSON.stringify(params)}`;
};

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Cache hit for: ${key}`);
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
  console.log(`💾 Cache set for: ${key}`);
};

// Clear cache (useful after mutations)
export const clearCache = () => {
  cache.clear();
  console.log('🧹 Cache cleared');
};

// ============================================================
// API METHODS WITH CACHING
// ============================================================

export const gameService = {
  // Get all games with optional filters
  getGames: async (params = {}) => {
    const cacheKey = getCacheKey('/games', params);
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      const response = await api.get('/games', { params });
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      // If cache exists but expired, return stale data as fallback
      const staleCache = cache.get(cacheKey);
      if (staleCache) {
        console.warn('⚠️ Returning stale cache data for:', cacheKey);
        return staleCache.data;
      }
      throw error;
    }
  },

  getGameById: async (id) => {
    if (!id) throw new Error('Game ID is required');
    const cacheKey = getCacheKey(`/games/${id}`);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    const response = await api.get(`/games/${id}`);
    setCachedData(cacheKey, response.data);
    return response.data;
  },

  getProviders: async () => {
    const cacheKey = getCacheKey('/games/providers');
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      const response = await api.get('/games/providers');
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      const staleCache = cache.get(cacheKey);
      if (staleCache) {
        console.warn('⚠️ Returning stale cache data for providers');
        return staleCache.data;
      }
      throw error;
    }
  },

  searchGames: async (query) => {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return gameService.getGames();
    }
    const cacheKey = getCacheKey('/games/search', { query });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    const response = await api.get('/games', { params: { search: query.trim() } });
    setCachedData(cacheKey, response.data);
    return response.data;
  },

  getGamesByProvider: async (provider) => {
    if (!provider) return gameService.getGames();
    const cacheKey = getCacheKey('/games/provider', { provider });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    const response = await api.get('/games', { params: { provider } });
    setCachedData(cacheKey, response.data);
    return response.data;
  },

  getGamesByCategory: async (category) => {
    if (!category) return gameService.getGames();
    const cacheKey = getCacheKey('/games/category', { category });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    const response = await api.get('/games', { params: { category } });
    setCachedData(cacheKey, response.data);
    return response.data;
  },

  getHotGames: async () => {
    const cacheKey = getCacheKey('/games/hot');
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    const response = await api.get('/games', { params: { hot: 'true' } });
    setCachedData(cacheKey, response.data);
    return response.data;
  },

  getNewGames: async () => {
    const cacheKey = getCacheKey('/games/new');
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    const response = await api.get('/games', { params: { new: 'true' } });
    setCachedData(cacheKey, response.data);
    return response.data;
  },

  // MUTATION METHODS (these should clear cache)
  startGame: async (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Game data is required');
    }
    const response = await api.post('/games/start', data);
    // Clear cache after starting a game
    clearCache();
    return response.data;
  },

  spin: async (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Spin data is required');
    }
    const response = await api.post('/games/spin', data);
    return response.data;
  },

  collectWin: async (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Collect data is required');
    }
    const response = await api.post('/games/collect', data);
    return response.data;
  },
};

export default gameService;
