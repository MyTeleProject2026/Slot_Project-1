const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const SLOTOPOL_URL = process.env.SLOTOPOL_URL || 'http://localhost:8080';
const SLOTOPOL_DEFAULT_USER_ID = 3; // Slotopol's default "player" user (uid=3)
let token = null;
let tokenExpiry = null;

class SlotopolService {
  /**
   * Get a valid JWT token from Slotopol.
   * Uses admin credentials from environment variables.
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

      // The token can be in `access`, `token`, or `data.access`
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
        timeout: 30000, // 30 seconds
      };
      if (data) config.data = data;

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Slotopol API error (${endpoint}):`, error.response?.data || error.message);
      // Re-throw a clean error for the caller
      throw new Error(error.response?.data?.what || 'Slotopol service error');
    }
  }

  // ============================================================
  // GAME SESSION ENDPOINTS
  // ============================================================

  /**
   * Start a new game session.
   * @param {number} userId - FattBet user ID (not used; we use fixed Slotopol user)
   * @param {string} provider - e.g., "novomatic"
   * @param {string} game - e.g., "bookofra"
   * @param {number} bet - Bet amount
   * @param {number} lines - Number of bet lines
   */
  static async startGame(userId, provider, game, bet, lines) {
    const alias = `${provider}/${game}`;
    // ✅ Use the fixed Slotopol user ID to avoid "user not found"
    return this.request('POST', '/game/new', {
      cid: 1,                  // virtual club
      uid: SLOTOPOL_DEFAULT_USER_ID, // always 3
      alias: alias
    });
  }

  /**
   * Perform a spin.
   * @param {number} gameId - The Slotopol game ID (gid) from the session
   * @param {number} bet - Bet amount (optional)
   * @param {number} lines - Number of lines (optional)
   */
  static async spin(gameId, bet, lines) {
    const data = { gid: parseInt(gameId) };
    if (bet) data.bet = bet;
    if (lines) data.sel = parseInt(lines);
    return this.request('POST', '/slot/spin', data);
  }

  /**
   * Collect the current win (end double-up mode).
   */
  static async collect(gameId) {
    return this.request('POST', '/slot/collect', { gid: parseInt(gameId) });
  }

  // ============================================================
  // GAME INFORMATION ENDPOINTS
  // ============================================================

  /**
   * Get detailed info about a game session.
   */
  static async getGameInfo(gameId) {
    return this.request('POST', '/game/info', { gid: parseInt(gameId) });
  }

  /**
   * Get the full list of available games.
   * Returns the raw response from /game/algs.
   */
  static async getGameList() {
    return this.request('GET', '/game/algs');
  }

  /**
   * Get images for a specific game (from Cloudinary).
   */
  static async getGameImages(gameId) {
    try {
      return await this.request('GET', `/cloudinary/images?folder=games/${gameId}`);
    } catch (error) {
      console.warn(`No images found for game ${gameId}`);
      return { images: [] };
    }
  }

  // ============================================================
  // ADMIN / RECHARGE ENDPOINTS
  // ============================================================

  /**
   * Add balance to a user's wallet (used for recharges).
   * @param {number} uid - Slotopol user ID (e.g., 1 for main admin)
   * @param {number} cid - Club ID (default 1)
   * @param {number} sum - Amount to add
   */
  static async addBalanceToUser({ uid, cid = 1, sum }) {
    return this.request('POST', '/prop/wallet/add', {
      cid,
      uid: parseInt(uid),
      sum
    });
  }
}

module.exports = SlotopolService;
