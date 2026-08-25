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
const normalizeGameId = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9_\/]/g, '');
const normalizePhone = (value) => {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `95${digits.slice(1)}`;
  return digits;
};

function accounts() {
  try {
    const value = JSON.parse(process.env.SLOTOPOL_CLUB_ACCOUNTS || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch { throw new Error('SLOTOPOL_CLUB_ACCOUNTS must be valid JSON'); }
}

class SlotopolService {
  static getN999BetClubId() { return slotopolConfig.clubId; }

  static resolveClubId(clubId) {
    const configured = this.getN999BetClubId();
    const requested = Number(clubId);
    if (Number.isInteger(requested) && requested > 0 && requested !== configured) {
      const error = new Error(`N999Bet is bound to Slotopol club ${configured}; requested club ${requested} is not allowed`);
      error.status = 403; error.code = 'N999BET_SLOTOPOL_CLUB_MISMATCH'; throw error;
    }
    return configured;
  }

  static async getToken() {
    if (token && tokenExpiry > Date.now() + 30000) return token;
    try {
      const response = await axios.post(`${SLOTOPOL_URL}/signin`, {
        email: slotopolConfig.adminEmail,
        secret: slotopolConfig.adminPassword,
      }, { timeout: 30000 });
      token = response.data?.access || response.data?.token || response.data?.data?.access;
      if (!token) throw new Error('No token returned by Slotopol signin');
      tokenExpiry = Date.now() + 55 * 60 * 1000;
      return token;
    } catch (error) {
      token = null; tokenExpiry = 0;
      throw new Error(error.response?.data?.what || error.response?.data?.error || 'Slotopol authentication failed');
    }
  }

  static async request(method, endpoint, data) {
    try {
      const access = await this.getToken();
      const response = await axios({ method, url: `${SLOTOPOL_URL}${endpoint}`, headers: {
        Authorization: `Bearer ${access}`, 'Content-Type': 'application/json', Accept: 'application/json'
      }, data, timeout: 30000 });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) { token = null; tokenExpiry = 0; }
      const err = new Error(error.response?.data?.what || error.response?.data?.error || error.message || 'Slotopol service error');
      err.status = error.response?.status || 502;
      throw err;
    }
  }

  static account(clubId) {
    const resolvedClubId = this.resolveClubId(clubId);
    const configured = accounts();
    const account = configured[String(resolvedClubId)] || configured[resolvedClubId] || {};
    const cid = Number(account.cid ?? process.env.SLOTOPOL_DEFAULT_CID ?? resolvedClubId);
    const uid = Number(account.uid ?? process.env.SLOTOPOL_DEFAULT_UID);
    if (!Number.isInteger(cid) || cid <= 0) throw new Error(`No Slotopol CID configured for N999Bet club ${resolvedClubId}`);
    if (cid !== resolvedClubId) {
      const error = new Error(`N999Bet requires Slotopol CID ${resolvedClubId}, but the configured account uses CID ${cid}`);
      error.status = 500; error.code = 'N999BET_SLOTOPOL_CID_MISMATCH'; throw error;
    }
    return { clubId: resolvedClubId, cid, uid };
  }

  static async getClubGames(cid) {
    return unwrap(await this.request('GET', `/game/list?inc=all&cid=${encodeURIComponent(cid)}&sort=true`));
  }

  static async getCatalog() { return unwrap(await this.request('GET', '/game/algs')); }

  static async getGameList(clubId) {
    const resolved = this.resolveClubId(clubId);
    const { cid } = this.account(resolved);
    return (await this.getClubGames(cid)).filter(g => g.enabled !== false && g.active !== false && g.status !== 'disabled');
  }

  static async assertGameEnabledForClub(clubId, provider, game) {
    const resolved = this.resolveClubId(clubId);
    const { cid } = this.account(resolved);
    const requestedId = normalizeGameId(`${provider}/${game}`);
    const list = await this.getClubGames(cid);
    const enabled = list.some(item => {
      const aliases = Array.isArray(item.aliases) ? item.aliases : [];
      const itemId = normalizeGameId(item.game_id || item.id || (item.prov && item.name ? `${item.prov}/${item.name}` : ''));
      return item.enabled !== false && item.active !== false && item.status !== 'disabled' &&
        (itemId === requestedId || aliases.some(a => normalizeGameId(`${a.prov}/${a.name}`) === requestedId));
    });
    if (!enabled) {
      const error = new Error(`Game ${provider}/${game} is not enabled for N999Bet Slotopol club ${resolved}`);
      error.status = 403; error.code = 'SLOTOPOL_GAME_DISABLED_FOR_CLUB'; throw error;
    }
  }

  static async findSlotopolUserByPhone(phone) {
    const normalized = normalizePhone(phone);
    if (!normalized) return 0;
    const response = await this.request('GET', `/user/phone?phone=${encodeURIComponent(normalized)}`);
    return Number(response?.uid || response?.data?.uid || 0);
  }

  static async createSlotopolUserByPhone(phone, displayName) {
    const normalized = normalizePhone(phone);
    if (!normalized) throw new Error('Player phone number is required for Slotopol identity');
    const response = await this.request('POST', '/user/phone', { phone: normalized, name: displayName || `N999Bet-${normalized}` });
    const uid = Number(response?.uid || response?.data?.uid || response?.user?.uid || 0);
    if (!uid) throw new Error('Slotopol phone provisioning succeeded without returning a UID');
    return uid;
  }

  // Every N999Bet player gets a dedicated Slotopol UID. Identity is keyed by
  // the player's phone number, never by the player's email address.
  static async ensurePlayerUid(userId, clubId, phone, displayName) {
    const SlotopolPlayer = require('../models/SlotopolPlayer');
    const resolved = this.resolveClubId(clubId);
    const normalized = normalizePhone(phone);
    if (!normalized) throw new Error('Player phone number is required to create a Slotopol identity');

    const existing = await SlotopolPlayer.find(userId, resolved);
    if (existing?.slotopol_uid) {
      if (existing.phone !== normalized) await SlotopolPlayer.setPhone(userId, resolved, normalized);
      return Number(existing.slotopol_uid);
    }

    const existingByPhone = await SlotopolPlayer.findByPhone(normalized, resolved);
    if (existingByPhone?.slotopol_uid) {
      await SlotopolPlayer.create({ userId, clubId: resolved, slotopolUid: Number(existingByPhone.slotopol_uid), phone: normalized });
      return Number(existingByPhone.slotopol_uid);
    }

    let uid = await this.findSlotopolUserByPhone(normalized);
    if (!uid) uid = await this.createSlotopolUserByPhone(normalized, displayName);
    if (!Number.isInteger(uid) || uid <= 0) throw new Error('Invalid Slotopol UID returned for phone identity');
    await SlotopolPlayer.create({ userId, clubId: resolved, slotopolUid: uid, phone: normalized });
    return uid;
  }

  static async startGame(clubId, provider, game, playerUid) {
    const resolved = this.resolveClubId(clubId);
    const { cid } = this.account(resolved);
    const uid = Number(playerUid);
    if (!Number.isInteger(uid) || uid <= 0) throw new Error(`Invalid Slotopol UID for N999Bet player in club ${resolved}`);
    await this.assertGameEnabledForClub(resolved, provider, game);
    return this.request('POST', '/game/new', { cid, uid, alias: `${provider}/${game}` });
  }

  static async spin(gid, bet, lines) {
    const data = { gid: Number(gid) };
    if (bet != null) data.bet = Number(bet);
    if (lines != null) data.sel = Number(lines);
    return this.request('POST', '/slot/spin', data);
  }
  static async collect(gid) { return this.request('POST', '/slot/collect', { gid: Number(gid) }); }
  static async getGameInfo(gid) { return this.request('POST', '/game/info', { gid: Number(gid) }); }
  static async getGameImages() { return { images: [] }; }
}

module.exports = SlotopolService;
