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

const normalizeCapabilities = (payload) => {
  const root = payload?.game || payload?.data?.game || payload || {};
  const capabilities = root.capabilities || payload?.capabilities || {};
  const raw = root.raw || payload?.raw || {};
  return { ...payload, game: { ...root, id: String(root.id || root.game_id || raw.id || raw.game_id || ''), name: root.name || raw.name || '', provider: root.provider || raw.provider || raw.prov || '', raw, capabilities: { gameType: Number(capabilities.gameType ?? raw.gt ?? 1), reels: Number(capabilities.reels ?? raw.sx ?? 0), rows: Number(capabilities.rows ?? raw.sy ?? 0), lines: Number(capabilities.lines ?? raw.ln ?? raw.lnum ?? 0), symbolCount: Number(capabilities.symbolCount ?? raw.sn ?? 0), rtpOptions: Array.isArray(capabilities.rtpOptions) ? capabilities.rtpOptions : (Array.isArray(raw.rtp) ? raw.rtp : []), serverAuthoritative: capabilities.serverAuthoritative !== false, operations: capabilities.operations || {}, renderer: capabilities.renderer || {} } } };
};

export const gameService = {
  getGames: async (params = {}) => { const key = getCacheKey('/games/available', params); const cached = getCachedData(key); if (cached) return cached; try { const response = await api.get('/games/available', { params }); setCachedData(key, response.data); return response.data; } catch (error) { const stale = cache.get(key); if (stale) return stale.data; throw error; } },
  getGameById: async (id) => { if (!id) throw new Error('Game ID is required'); return (await api.get(`/games/${encodeURIComponent(id)}`)).data; },
  getGameCapabilities: async (id) => { if (!id) throw new Error('Game ID is required'); const key = getCacheKey('/games/capabilities', { id }); const cached = getCachedData(key); if (cached) return cached; try { const data = normalizeCapabilities((await api.get(`/games/capabilities/${encodeURIComponent(id)}`)).data); setCachedData(key, data); return data; } catch (error) { const stale = cache.get(key); if (stale) return stale.data; throw error; } },
  getProviders: async () => (await api.get('/games/providers')).data,
  searchGames: async (query) => gameService.getGames(query?.trim() ? { search: query.trim() } : {}),
  getGamesByProvider: async (provider) => gameService.getGames(provider ? { provider } : {}),
  getGamesByCategory: async (category) => gameService.getGames(category ? { category } : {}),
  getHotGames: async () => gameService.getGames({ hot: 'true' }),
  getNewGames: async () => gameService.getGames({ new: 'true' }),
  startGame: async (data) => { if (!data || typeof data !== 'object') throw new Error('Game data is required'); return (await api.post('/games/start', data)).data; },
  spin: async (data) => { if (!data || typeof data !== 'object') throw new Error('Spin data is required'); return (await api.post('/games/spin', data)).data; },
  collectWin: async (data) => { if (!data || typeof data !== 'object') throw new Error('Collect data is required'); return (await api.post('/games/collect', data)).data; },
  doubleUp: async (data) => { if (!data || typeof data !== 'object') throw new Error('Double-up data is required'); return (await api.post('/games/doubleup', data)).data; },
  setLines: async (data) => { if (!data || typeof data !== 'object') throw new Error('Line selection data is required'); return (await api.post('/games/lines', data)).data; },
};

export default gameService;