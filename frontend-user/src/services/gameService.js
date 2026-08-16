import api from './api';

export const gameService = {
  // Get all games with optional filters
  getGames: async (apiInstance, params = {}) => {
    // Ensure params is always an object
    const safeParams = params && typeof params === 'object' ? params : {};
    const response = await apiInstance.get('/games', { params: safeParams });
    return response.data;
  },

  getGameById: async (apiInstance, id) => {
    if (!id) throw new Error('Game ID is required');
    const response = await apiInstance.get(`/games/${id}`);
    return response.data;
  },

  getProviders: async (apiInstance) => {
    const response = await apiInstance.get('/games/providers');
    return response.data;
  },

  searchGames: async (apiInstance, query) => {
    if (!query || typeof query !== 'string') {
      return gameService.getGames(apiInstance);
    }
    const response = await apiInstance.get('/games', { params: { search: query } });
    return response.data;
  },

  getGamesByProvider: async (apiInstance, provider) => {
    if (!provider) {
      return gameService.getGames(apiInstance);
    }
    const response = await apiInstance.get('/games', { params: { provider } });
    return response.data;
  },

  getGamesByCategory: async (apiInstance, category) => {
    if (!category) {
      return gameService.getGames(apiInstance);
    }
    const response = await apiInstance.get('/games', { params: { category } });
    return response.data;
  },

  getHotGames: async (apiInstance) => {
    const response = await apiInstance.get('/games', { params: { hot: 'true' } });
    return response.data;
  },

  getNewGames: async (apiInstance) => {
    const response = await apiInstance.get('/games', { params: { new: 'true' } });
    return response.data;
  },

  startGame: async (apiInstance, data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Game data is required');
    }
    const response = await apiInstance.post('/games/start', data);
    return response.data;
  },

  spin: async (apiInstance, data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Spin data is required');
    }
    const response = await apiInstance.post('/games/spin', data);
    return response.data;
  },

  collectWin: async (apiInstance, data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Collect data is required');
    }
    const response = await apiInstance.post('/games/collect', data);
    return response.data;
  },
};

export default gameService;
