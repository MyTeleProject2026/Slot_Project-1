// ============================================================
// APPLICATION CONSTANTS
// ============================================================

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'FattBet Super Admin';

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'FaTachometerAlt' },
  { path: '/users', label: 'Users', icon: 'FaUsers' },
  { path: '/games', label: 'Games', icon: 'FaGamepad' },
  { path: '/transactions', label: 'Transactions', icon: 'FaExchangeAlt' },
  { path: '/promotions', label: 'Promotions', icon: 'FaGift' },
  { path: '/banners', label: 'Banners', icon: 'FaImage' },
  { path: '/languages', label: 'Languages', icon: 'FaLanguage' },
  { path: '/settings/general', label: 'Settings', icon: 'FaCog' },
  { path: '/support', label: 'Support Chat', icon: 'FaHeadset' },
];

export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'admin-theme',
};

export const DEFAULT_MESSAGES = {
  LOADING: 'Loading...',
  NO_DATA: 'No data available',
  ERROR: 'Something went wrong. Please try again.',
  SUCCESS: 'Operation completed successfully.',
  UNAUTHORIZED: 'Please login to continue.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  DEFAULT_LIMITS: [10, 20, 50, 100],
};

export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const USER_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
  PENDING: 'pending',
};

export const GAME_STATUSES = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  DISABLED: 'disabled',
};

export const VOLATILITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very-high',
};

export default {
  API_URL,
  APP_NAME,
  NAV_ITEMS,
  STORAGE_KEYS,
  DEFAULT_MESSAGES,
  PAGINATION,
  TRANSACTION_STATUSES,
  USER_STATUSES,
  GAME_STATUSES,
  VOLATILITY,
};
