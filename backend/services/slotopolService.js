const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const SLOTOPOL_URL = (process.env.SLOTOPOL_URL || 'http://localhost:8080').replace(/\/+$/, '');
let token = null;
let tokenExpiry = 0;

function parseClubAccounts() {
  try {
    const raw = process.env.SLOTOPOL_CLUB_ACCOUNTS || '{}';
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    throw new Error('SLOTOPOL_CLUB_ACCOUNTS must be valid JSON');
  }
}

class SlotopolService {
  static async getToken() {
    if (token && tokenExpiry > Date.now() + 30_000) return token;

    try {
      const response = await axios.post(`${SLOTOPOL_URL}/signin`, {
        email: process.env.SLOTOPOL_ADMIN_EMAIL,
        secret: process.env.SLOTOPOL_ADMIN_PASSWORD
      }, { timeout: 30000 });

      token = response.data.access || response.data.token || response.data?.data?.access;
      if (!token) throw new Error('No token in Slotopol signin response');

      tokenExpiry = Date.now() + (55 * 60 * 1000);
      return token;
    } catch (error) {
      console.error('Slotopol token error:', error.response?.data || error.message);
      throw new Error('Slotopol authentication failed');
    }
  }

  static async request(method, endpoint, data = null) {
    try {
      const access = await this.getToken();
      const config = {
        method,
        url: `${SLOTOPOL_URL}${endpoint}`,
        headers: {
          Authorization: `Bearer ${access}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        timeout: 30000
      };
      if (data !== null) config.data = data;
      return (await axios(config)).data;
    } catch (error) {
      const status = error.response?.status;
      const providerError = error.response?.data?.what ||
        error.response?.data?.error ||
        error.response?.data?.message;
      const err = new Error(providerError || 'Slotopol service error');
      err.status = status || 502;
      err.provider = error.response?.data;
      throw err;
    }
  }

  /*
   * IMPORTANT FINANCIAL BOUNDARY
   * ----------------------------
   * N999Bet customer wallets are NOT mirrored into Slotopol.
   * Slotopol receives a separate club/provider account (cid + uid).
   *
   * Configure:
   * SLOTOPOL_CLUB_ACCOUNTS={"1":{"cid":1,"uid":123},"2":{"cid":2,"uid":456}}
   * SLOTOPOL_DEFAULT_CID=1
   * SLOTOPOL_DEFAULT_UID=123
   *
   * These are provider-side service accounts, never customer UIDs.
   */
  static getClubProviderAccount(clubId = 1) {
    const accounts = parseClubAccounts();
    const selected = accounts[String(clubId)] || accounts[clubId];
    const cid = Number(selected?.cid ?? process.env.SLOTOPOL_DEFAULT_CID);
    const uid = Number(selected?.uid ?? process.env.SLOTOPOL_DEFAULT_UID);

    if (!Number.isInteger(cid) || cid <= 0 || !Number.isInteger(uid) || uid <= 0) {
      throw new Error(`No Slotopol provider account configured for club ${clubId}`);
    }
    return { cid, uid };
  }

  static async startGame(clubId, provider, game) {
    const { cid, uid } = this.getClubProviderAccount(clubId);
    const alias = `${provider}/${game}`;
    return this.request('POST', '/game/new', { cid, uid, alias });
  }

  static async spin(gameId, bet, lines) {
    const data = { gid: Number(gameId) };
    if (bet !== undefined && bet !== null) data.bet = Number(bet);
    if (lines !== undefined && lines !== null) data.sel = Number(lines);
    return this.request('POST', '/slot/spin', data);
  }

  static async collect(gameId) {
    return this.request('POST', '/slot/collect', { gid: Number(gameId) });
  }

  static async getGameInfo(gameId) {
    return this.request('POST', '/game/info', { gid: Number(gameId) });
  }

  static async getGameList() {
    return this.request('GET', '/game/algs');
  }

  static async getGameImages(gameId) {
    try {
      return await this.request('GET', `/cloudinary/images?folder=games/${encodeURIComponent(gameId)}`);
    } catch {
      return { images: [] };
    }
  }
}

module.exports = SlotopolService;
