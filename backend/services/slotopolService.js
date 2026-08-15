const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const SLOTOPOL_URL = process.env.SLOTOPOL_URL || 'http://localhost:8080';
let token = null;
let tokenExpiry = null;

class SlotopolService {
  static async getToken() {
    if (token && tokenExpiry && tokenExpiry > Date.now()) {
      return token;
    }
    try {
      const response = await axios.post(`${SLOTOPOL_URL}/signin`, {
        email: process.env.SLOTOPOL_ADMIN_EMAIL || 'admin@slotopol.com',
        secret: process.env.SLOTOPOL_ADMIN_PASSWORD || 'admin123'
      });
      token = response.data.token;
      tokenExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
      return token;
    } catch (error) {
      console.error('Slotopol token error:', error.message);
      throw new Error('Slotopol authentication failed');
    }
  }

  static async request(method, endpoint, data = null) {
    const token = await this.getToken();
    const url = `${SLOTOPOL_URL}${endpoint}`;
    try {
      const config = { method, url, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };
      if (data) config.data = data;
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Slotopol API error (${endpoint}):`, error.response?.data || error.message);
      throw new Error(error.response?.data?.what || 'Slotopol service error');
    }
  }

  static async startGame(userId, provider, game, bet, lines) {
    const alias = `${provider}/${game}`;
    return this.request('POST', '/game/new', { cid: 1, uid: userId, alias });
  }

  static async spin(gameId, bet, lines) {
    const data = { gid: gameId };
    if (bet) data.bet = bet;
    if (lines) data.sel = lines;
    return this.request('POST', '/slot/spin', data);
  }

  static async doubleUp(gameId, multiplier) {
    return this.request('POST', '/slot/doubleup', { gid: gameId, mult: multiplier || 2 });
  }

  static async collect(gameId) {
    return this.request('POST', '/slot/collect', { gid: gameId });
  }

  static async getGameInfo(gameId) {
    return this.request('POST', '/game/info', { gid: gameId });
  }

  static async getGameList() {
    return this.request('GET', '/game/algs');
  }

  static async getGameListFiltered(filters) {
    return this.request('GET', `/game/list?inc=${filters}`);
  }
}

module.exports = SlotopolService;
