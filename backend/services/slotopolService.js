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
      token = response.data.access || response.data.token;
      // Try different token formats
      if (!token) {
        token = response.data.token || response.data.access;
      }
      tokenExpiry = Date.now() + (60 * 60 * 1000);
      return token;
    } catch (error) {
      console.error('Slotopol token error:', error.response?.data || error.message);
      throw new Error('Slotopol authentication failed');
    }
  }

  static async request(method, endpoint, data = null) {
    try {
      const token = await this.getToken();
      const url = `${SLOTOPOL_URL}${endpoint}`;
      const config = {
        method,
        url,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      if (data) config.data = data;
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Slotopol API error (${endpoint}):`, error.response?.data || error.message);
      throw new Error(error.response?.data?.what || 'Slotopol service error');
    }
  }
  // Add this method to the class
  static async addBalanceToUser({ uid, cid = 1, sum }) {
    return this.request('POST', '/prop/wallet/add', {
      cid,
      uid: parseInt(uid),
      sum
    });
  }

  static async startGame(userId, provider, game, bet, lines) {
    const alias = `${provider}/${game}`;
    return this.request('POST', '/game/new', {
      cid: 1,
      uid: parseInt(userId),
      alias: alias
    });
  }

  static async spin(gameId, bet, lines) {
    const data = { gid: parseInt(gameId) };
    if (bet) data.bet = bet;
    if (lines) data.sel = parseInt(lines);
    return this.request('POST', '/slot/spin', data);
  }

  static async collect(gameId) {
    return this.request('POST', '/slot/collect', { gid: parseInt(gameId) });
  }

  static async getGameInfo(gameId) {
    return this.request('POST', '/game/info', { gid: parseInt(gameId) });
  }

  static async getGameList() {
    return this.request('GET', '/game/algs');
  }
}

module.exports = SlotopolService;
