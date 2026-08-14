import api from './api';

export const gameService = {
  getGames: (params = {}) => api.get('/games', { params }).then(res => res.data),
  getGameById: (id) => api.get(`/games/${id}`).then(res => res.data),
  getProviders: () => api.get('/games/providers').then(res => res.data),
  searchGames: (query) => api.get('/games', { params: { search: query } }).then(res => res.data),
  getGamesByProvider: (provider) => api.get('/games', { params: { provider } }).then(res => res.data),
  getGamesByCategory: (category) => api.get('/games', { params: { category } }).then(res => res.data),
  getHotGames: () => api.get('/games', { params: { hot: 'true' } }).then(res => res.data),
  getNewGames: () => api.get('/games', { params: { new: 'true' } }).then(res => res.data),
  startGame: (data) => api.post('/games/start', data).then(res => res.data),
  spin: (data) => api.post('/games/spin', data).then(res => res.data),
  collectWin: (data) => api.post('/games/collect', data).then(res => res.data),
};

export default gameService;