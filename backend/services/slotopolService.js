const axios = require('axios');
const dotenv = require('dotenv');
const slotopolConfig = require('../config/slotopol');

dotenv.config();

const SLOTOPOL_URL = slotopolConfig.url.replace(/\/+$/, '');
let token = null;
let tokenExpiry = 0;

const unwrap = (r) => {
  if (Array.isArray(r)) return r;
  return r?.list || r?.games || r?.clubs || r?.data?.list || r?.data?.games || r?.data || [];
};

const normalizeGameId = (value) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9_\/]/g, '');

function accounts() {
  try {
    const value = JSON.parse(process.env.SLOTOPOL_CLUB_ACCOUNTS || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    throw new Error('SLOTOPOL_CLUB_ACCOUNTS must be valid JSON');
  }
}

class SlotopolService {
  /**
   * N999Bet is explicitly bound to Slotopol Club ID 1 by default.
   * The value can only be changed intentionally with N999BET_SLOTOPOL_CLUB_ID.
   */
  static getN999BetClubId() {
    return slotopolConfig.clubId;
  }

  static resolveClubId(clubId) {
    const configured = this.getN999BetClubId();
    const requested = Number(clubId);

    // N999Bet must never accidentally use another Slotopol club.
    if (Number.isInteger(requested) && requested > 0 && requested !== configured) {
      const error = new Error(
        `N999Bet is bound to Slotopol club ${configured}; requested club ${requested} is not allowed`
      );
      error.status = 403;
      error.code = 'N999BET_SLOTOPOL_CLUB_MISMATCH';
      throw error;
    }

    return configured;
  }

  static async getToken() {
    if (token && tokenExpiry > Date.now() + 30000) return token;

    const body = {
      email: slotopolConfig.adminEmail,
      secret: slotopolConfig.adminPassword,
    };

    try {
      const response = await axios.post(`${SLOTOPOL_URL}/signin`, body, {
        timeout: 30000,
      });

      token =
        response.data?.access ||
        response.data?.token ||
        response.data?.data?.access;

      if (!token) throw new Error('No token returned by Slotopol signin');

      tokenExpiry = Date.now() + 55 * 60 * 1000;
      return token;
    } catch (error) {
      token = null;
      tokenExpiry = 0;
      throw new Error(
        error.response?.data?.what ||
        error.response?.data?.error ||
        'Slotopol authentication failed'
      );
    }
  }

  static async request(method, endpoint, data) {
    try {
      const access = await this.getToken();
      const response = await axios({
        method,
        url: `${SLOTOPOL_URL}${endpoint}`,
        headers: {
          Authorization: `Bearer ${access}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        data,
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      // If the cached token expired/revoked, clear it so the next request
      // performs a fresh Slotopol signin instead of repeatedly reusing it.
      if (error.response?.status === 401) {
        token = null;
        tokenExpiry = 0;
      }

      const err = new Error(
        error.response?.data?.what ||
        error.response?.data?.error ||
        error.message ||
        'Slotopol service error'
      );
      err.status = error.response?.status || 502;
      throw err;
    }
  }

  static account(clubId) {
    const resolvedClubId = this.resolveClubId(clubId);
    const configuredAccounts = accounts();
    const account =
      configuredAccounts[String(resolvedClubId)] ||
      configuredAccounts[resolvedClubId] ||
      {};

    const cid = Number(account.cid ?? process.env.SLOTOPOL_DEFAULT_CID ?? resolvedClubId);
    const uid = Number(account.uid ?? process.env.SLOTOPOL_DEFAULT_UID);

    if (!Number.isInteger(cid) || cid <= 0) {
      throw new Error(`No Slotopol CID configured for N999Bet club ${resolvedClubId}`);
    }

    if (cid !== resolvedClubId) {
      const error = new Error(
        `N999Bet requires Slotopol CID ${resolvedClubId}, but the configured account uses CID ${cid}`
      );
      error.status = 500;
      error.code = 'N999BET_SLOTOPOL_CID_MISMATCH';
      throw error;
    }

    return { clubId: resolvedClubId, cid, uid };
  }

  /**
   * Use Slotopol's authoritative club-aware game endpoint.
   * This replaces the old /club/games dependency, which could return 502
   * on deployments where that route is unavailable.
   */
  static async getClubGames(cid) {
    const response = await this.request(
      'GET',
      `/game/list?inc=all&cid=${encodeURIComponent(cid)}&sort=true`
    );
    return unwrap(response);
  }

  static async getCatalog() {
    return unwrap(await this.request('GET', '/game/algs'));
  }

  static async getGameList(clubId) {
    const resolvedClubId = this.resolveClubId(clubId);
    const { cid } = this.account(resolvedClubId);

    // The club-aware /game/list response is authoritative. It contains the
    // games available to this club and their current enabled state.
    const clubGames = await this.getClubGames(cid);

    return clubGames.filter(
      (game) =>
        game.enabled !== false &&
        game.active !== false &&
        game.status !== 'disabled'
    );
  }

  static async assertGameEnabledForClub(cid, provider, game) {
    const resolvedClubId = this.resolveClubId(cid);
    const { cid: slotopolCid } = this.account(resolvedClubId);
    const requestedId = normalizeGameId(`${provider}/${game}`);
    const list = await this.getClubGames(slotopolCid);

    const enabled = list.some((item) => {
      const aliases = Array.isArray(item.aliases) ? item.aliases : [];
      const itemId = normalizeGameId(
        item.game_id ||
          item.id ||
          (item.prov && item.name ? `${item.prov}/${item.name}` : '')
      );

      return (
        item.enabled !== false &&
        item.active !== false &&
        item.status !== 'disabled' &&
        (itemId === requestedId ||
          aliases.some((alias) =>
            normalizeGameId(`${alias.prov}/${alias.name}`) === requestedId
          ))
      );
    });

    if (!enabled) {
      const error = new Error(
        `Game ${provider}/${game} is not enabled for N999Bet Slotopol club ${resolvedClubId}`
      );
      error.status = 403;
      error.code = 'SLOTOPOL_GAME_DISABLED_FOR_CLUB';
      throw error;
    }
  }

  static async startGame(clubId, provider, game) {
    const resolvedClubId = this.resolveClubId(clubId);
    const { cid, uid } = this.account(resolvedClubId);

    if (!Number.isInteger(uid) || uid <= 0) {
      throw new Error(`No Slotopol UID configured for N999Bet club ${resolvedClubId}`);
    }

    await this.assertGameEnabledForClub(resolvedClubId, provider, game);

    return this.request('POST', '/game/new', {
      cid,
      uid,
      alias: `${provider}/${game}`,
    });
  }

  static async spin(gid, bet, lines) {
    const data = { gid: Number(gid) };
    if (bet != null) data.bet = Number(bet);
    if (lines != null) data.sel = Number(lines);
    return this.request('POST', '/slot/spin', data);
  }

  static async collect(gid) {
    return this.request('POST', '/slot/collect', { gid: Number(gid) });
  }

  static async getGameInfo(gid) {
    return this.request('POST', '/game/info', { gid: Number(gid) });
  }

  static async getGameImages() {
    return { images: [] };
  }
}

module.exports = SlotopolService;
