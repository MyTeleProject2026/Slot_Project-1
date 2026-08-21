const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const SLOTOPOL_URL = process.env.SLOTOPOL_URL || 'http://localhost:8080';
let token = null;
let tokenExpiry = null;

class SlotopolService {
  /**
   * Get a valid JWT token from Slotopol.
   */
  static async getToken() {
    if (token && tokenExpiry && tokenExpiry > Date.now()) {
      return token;
    }

    try {
      const response = await axios.post(`${SLOTOPOL_URL}/signin`, {
        email: process.env.SLOTOPOL_ADMIN_EMAIL || 'admin@slotopol.com',
        secret: process.env.SLOTOPOL_ADMIN_PASSWORD || 'admin123'
      });

      token = response.data.access || response.data.token || response.data?.data?.access;
      if (!token) {
        throw new Error('No token in response');
      }

      tokenExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
      return token;
    } catch (error) {
      console.error('Slotopol token error:', error.response?.data || error.message);
      throw new Error('Slotopol authentication failed');
    }
  }

  /**
   * Make an authenticated request to the Slotopol API.
   */
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
        },
        timeout: 30000,
      };
      if (data) config.data = data;

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Slotopol API error (${endpoint}):`, error.response?.data || error.message);
      throw new Error(error.response?.data?.what || 'Slotopol service error');
    }
  }

  // ============================================================
  // USER SYNC ENDPOINTS
  // ============================================================

  /**
   * Mirror a user from N999Bet to Slotopol.
   */
  static async createSlotopolUser(email, name, secret) {
    const token = await this.getToken();
    const res = await this.request('POST', '/signup', {
      email, name, secret
    });
    return res.uid; // Returns the real Slotopol UID
  }

  /**
   * Update a user's wallet on Slotopol (Deposits / Withdrawals).
   */
  static async adjustWallet(uid, amount) {
    const token = await this.getToken();
    await this.request('POST', '/prop/wallet/add', {
      cid: 1, // N999Bet's Club ID in Slotopol
      uid: parseInt(uid),
      sum: amount
    });
  }

  // ============================================================
  // GAME SESSION ENDPOINTS
  // ============================================================

  /**
   * Start a new game session for a specific Slotopol UID.
   */
  static async startGame(uid, provider, game, bet, lines) {
    const alias = `${provider}/${game}`;
    return this.request('POST', '/game/new', {
      cid: 1,
      uid: parseInt(uid), // Uses the real dynamic UID
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

  // ============================================================
  // GAME INFORMATION ENDPOINTS
  // ============================================================

  static async getGameInfo(gameId) {
    return this.request('POST', '/game/info', { gid: parseInt(gameId) });
  }

  static async getGameList() {
    return this.request('GET', '/game/algs');
  }

  static async getGameImages(gameId) {
    try {
      return await this.request('GET', `/cloudinary/images?folder=games/${gameId}`);
    } catch (error) {
      console.warn(`No images found for game ${gameId}`);
      return { images: [] };
    }
  }
}

module.exports = SlotopolService;
