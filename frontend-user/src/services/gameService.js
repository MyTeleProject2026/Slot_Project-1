import api from './api';

export const gameService = {
  // Get all games
  getGames: async (params = {}) => {
    try {
      // Ensure params is an object
      const safeParams = params && typeof params === 'object' ? params : {};
      const response = await api.get('/games', { params: safeParams });
      return response.data;
    } catch (error) {
      console.error('getGames error:', error);
      throw error;
    }
  },

  getGameById: async (id) => {
    if (!id) throw new Error('Game ID is required');
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  getProviders: async () => {
    try {
      const response = await api.get('/games/providers');
      return response.data;
    } catch (error) {
      console.error('getProviders error:', error);
      throw error;
    }
  },

  searchGames: async (query) => {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return gameService.getGames();
    }
    const response = await api.get('/games', { params: { search: query.trim() } });
    return response.data;
  },

  getGamesByProvider: async (provider) => {
    if (!provider) {
      return gameService.getGames();
    }
    const response = await api.get('/games', { params: { provider } });
    return response.data;
  },

  getGamesByCategory: async (category) => {
    if (!category) {
      return gameService.getGames();
    }
    const response = await api.get('/games', { params: { category } });
    return response.data;
  },

  getHotGames: async () => {
    const response = await api.get('/games', { params: { hot: 'true' } });
    return response.data;
  },

  getNewGames: async () => {
    const response = await api.get('/games', { params: { new: 'true' } });
    return response.data;
  },

  startGame: async (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Game data is required');
    }
    const response = await api.post('/games/start', data);
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
