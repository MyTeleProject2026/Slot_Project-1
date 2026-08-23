const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const SLOTOPOL_URL = (process.env.SLOTOPOL_URL || 'http://localhost:8080').replace(/\/+$/, '');
let token = null;
let tokenExpiry = 0;

function parseClubAccounts() {
  try {
    const parsed = JSON.parse(process.env.SLOTOPOL_CLUB_ACCOUNTS || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { throw new Error('SLOTOPOL_CLUB_ACCOUNTS must be valid JSON'); }
}

function normalizeGameId(provider, game) { return `${provider}/${game}`.toLowerCase().replace(/\s+/g, ''); }

class SlotopolService {
  static async getToken() {
    if (token && tokenExpiry > Date.now() + 30_000) return token;
    try {
      const response = await axios.post(`${SLOTOPOL_URL}/signin`, { email: process.env.SLOTOPOL_ADMIN_EMAIL, secret: process.env.SLOTOPOL_ADMIN_PASSWORD }, { timeout: 30000 });
      token = response.data.access || response.data.token || response.data?.data?.access;
      if (!token) throw new Error('No token in Slotopol signin response');
      tokenExpiry = Date.now() + 55 * 60 * 1000;
      return token;
    } catch (error) {
      console.error('Slotopol token error:', error.response?.data || error.message);
      throw new Error('Slotopol authentication failed');
    }
  }

  static async request(method, endpoint, data = null) {
    try {
      const access = await this.getToken();
      const config = { method, url: `${SLOTOPOL_URL}${endpoint}`, headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json', Accept: 'application/json' }, timeout: 30000 };
      if (data !== null) config.data = data;
      return (await axios(config)).data;
    } catch (error) {
      const err = new Error(error.response?.data?.what || error.response?.data?.error || error.response?.data?.message || 'Slotopol service error');
      err.status = error.response?.status || 502;
      err.provider = error.response?.data;
      throw err;
    }
  }

  // clubId is the N999Bet local club ID. The returned cid is the
  // authoritative Slotopol club ID used for permissions and game sessions.
  static getClubProviderAccount(clubId = 1) {
    const accounts = parseClubAccounts();
    const selected = accounts[String(clubId)] || accounts[clubId];
    const cid = Number(selected?.cid ?? process.env.SLOTOPOL_DEFAULT_CID);
    const uid = Number(selected?.uid ?? process.env.SLOTOPOL_DEFAULT_UID);
    if (!Number.isInteger(cid) || cid <= 0 || !Number.isInteger(uid) || uid <= 0) throw new Error(`No Slotopol provider account configured for club ${clubId}`);
    return { cid, uid };
  }

  static async getClubGames(slotopolClubId) {
    const cid = Number(slotopolClubId);
    if (!Number.isInteger(cid) || cid <= 0) throw new Error('Invalid Slotopol club ID');
    const response = await this.request('GET', `/club/games?cid=${encodeURIComponent(cid)}&inc=all`);
    return Array.isArray(response) ? response : (response?.list || response?.games || []);
  }

  static async assertGameEnabledForClub(slotopolClubId, provider, game) {
    const requested = normalizeGameId(provider, game);
    const games = await this.getClubGames(slotopolClubId);
    const enabled = games.some(item => {
      const raw = item.game_id || item.id || (item.prov && item.name ? `${item.prov}/${item.name}` : '');
      return String(raw).toLowerCase().replace(/\s+/g, '') === requested;
    });
    if (!enabled) {
      const err = new Error(`Game ${provider}/${game} is not enabled for Slotopol club ${slotopolClubId}`);
      err.status = 403;
      err.code = 'SLOTOPOL_GAME_DISABLED_FOR_CLUB';
      throw err;
    }
  }

  static async getClubProfile(clubId) {
    const response = await this.request('GET', `/admin/club/profile?cid=${encodeURIComponent(Number(clubId))}`);
    return response?.data || response;
  }

  static async startGame(clubId, provider, game) {
    const { cid, uid } = this.getClubProviderAccount(clubId);
    // IMPORTANT: permission is stored against Slotopol's cid, not the
    // N999Bet database club_id. This prevents false "game disabled" errors.
    await this.assertGameEnabledForClub(cid, provider, game);
    return this.request('POST', '/game/new', { cid, uid, alias: `${provider}/${game}` });
  }

  static async spin(gameId, bet, lines) {
    const data = { gid: Number(gameId) };
    if (bet !== undefined && bet !== null) data.bet = Number(bet);
    if (lines !== undefined && lines !== null) data.sel = Number(lines);
    return this.request('POST', '/slot/spin', data);
  }

  static async collect(gameId) { return this.request('POST', '/slot/collect', { gid: Number(gameId) }); }
  static async getGameInfo(gameId) { return this.request('POST', '/game/info', { gid: Number(gameId) }); }

  static async getGameList(clubId = process.env.N999BET_DEFAULT_CLUB_ID || 1) {
    const { cid } = this.getClubProviderAccount(clubId);
    const response = await this.request('GET', '/game/algs');
    const catalog = Array.isArray(response) ? response : (response?.list || response?.games || response?.data || []);
    const enabled = await this.getClubGames(cid);
    const allowed = new Set(enabled.map(item => {
      if (item.game_id || item.id) return String(item.game_id || item.id).toLowerCase().replace(/\s+/g, '');
      if (item.prov && item.name) return normalizeGameId(item.prov, item.name);
      return '';
    }).filter(Boolean));
    return catalog.filter(game => Array.isArray(game.aliases) && game.aliases.some(alias => allowed.has(normalizeGameId(alias.prov, alias.name))));
  }

  static async getGameImages(gameId) {
    try { return await this.request('GET', `/cloudinary/images?folder=games/${encodeURIComponent(gameId)}`); }
    catch { return { images: [] }; }
  }
}

module.exports = SlotopolService;
