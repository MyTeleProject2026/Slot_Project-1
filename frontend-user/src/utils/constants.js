// ============================================================
// APPLICATION CONSTANTS
// ============================================================

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'FattBet';
export const APP_VERSION = '1.0.0';

// Currency
export const CURRENCY = 'THB';
export const CURRENCY_SYMBOL = '฿';

// Game Categories
export const GAME_CATEGORIES = [
  { id: 'slots', name: 'Slots', icon: '🎰', path: '/games/slots' },
  { id: 'live', name: 'Live Casino', icon: '🎲', path: '/games/live-casino' },
  { id: 'sports', name: 'Sports', icon: '⚽', path: '/games/sports' },
  { id: 'fishing', name: 'Fishing', icon: '🎣', path: '/games/fishing' },
  { id: 'lotto', name: 'Lotto', icon: '🎱', path: '/games/lotto' },
];

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
  { id: 'crypto', name: 'Cryptocurrency', icon: '₿' },
  { id: 'e_wallet', name: 'E-Wallet', icon: '📱' },
];

// Transaction Types
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  BONUS: 'bonus',
  COMMISSION: 'commission',
  BET: 'bet',
  WIN: 'win',
  REFUND: 'refund',
  ADJUSTMENT: 'adjustment',
};

// Transaction Statuses
export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// Wallet Types
export const WALLET_TYPES = {
  MAIN: 'main',
  BONUS: 'bonus',
  COMMISSION: 'commission',
  LOCKED: 'locked',
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  MAIN_ADMIN: 'main_admin',
};

// User Statuses
export const USER_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
  PENDING: 'pending',
};

// Game Statuses
export const GAME_STATUSES = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  DISABLED: 'disabled',
};

// Provider Volatility
export const VOLATILITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very-high',
};

// Navigation Menu Items
export const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'FaHome' },
  { path: '/games', label: 'Games', icon: 'FaGamepad' },
  { path: '/promotions', label: 'Promotions', icon: 'FaGift' },
  { path: '/wallet', label: 'Wallet', icon: 'FaWallet' },
  { path: '/profile', label: 'Profile', icon: 'FaUser' },
];

// Bottom Navigation Items (Mobile)
export const BOTTOM_NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'FaHome' },
  { path: '/games', label: 'Games', icon: 'FaGamepad' },
  { path: '/promotions', label: 'Promos', icon: 'FaGift' },
  { path: '/wallet', label: 'Wallet', icon: 'FaWallet' },
  { path: '/profile', label: 'Profile', icon: 'FaUser' },
];

// Quick Deposit Amounts
export const QUICK_DEPOSIT_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

// Quick Withdraw Amounts
export const QUICK_WITHDRAW_AMOUNTS = [500, 1000, 2500, 5000, 10000, 20000];

// Minimum and Maximum Limits
export const LIMITS = {
  MIN_DEPOSIT: 100,
  MAX_DEPOSIT: 100000,
  MIN_WITHDRAW: 500,
  MAX_WITHDRAW: 50000,
  MIN_BET: 1,
  MAX_BET: 1000,
};

// Toast Durations
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  FAVORITES: 'favorites',
  LANGUAGE: 'language',
};

// Default Messages
export const DEFAULT_MESSAGES = {
  LOADING: 'Loading...',
  NO_DATA: 'No data available',
  ERROR: 'Something went wrong. Please try again.',
  SUCCESS: 'Operation completed successfully.',
  UNAUTHORIZED: 'Please login to continue.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://www.facebook.com/',
  INSTAGRAM: 'https://www.instagram.com/',
  YOUTUBE: 'https://www.youtube.com/',
  TELEGRAM: 'https://t.me/',
  WHATSAPP: 'https://wa.me/',
};

// Support Contact
export const SUPPORT = {
  EMAIL: 'support@fattbet.com',
  PHONE: '+66 2 123 4567',
  WHATSAPP: 'https://wa.me/yournumber',
  TELEGRAM: 'https://t.me/yourusername',
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
};

// Default Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  DEFAULT_LIMITS: [10, 20, 50, 100],
};

// Image Placeholders
export const IMAGE_PLACEHOLDERS = {
  GAME: '/assets/images/placeholder-game.png',
  PROVIDER: '/assets/images/placeholder-provider.png',
  AVATAR: '/assets/images/placeholder-avatar.png',
  BANNER: '/assets/images/placeholder-banner.png',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_TIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  TIME_ONLY: 'HH:mm',
};

export default {
  API_URL,
  APP_NAME,
  APP_VERSION,
  CURRENCY,
  CURRENCY_SYMBOL,
  GAME_CATEGORIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  WALLET_TYPES,
  USER_ROLES,
  USER_STATUSES,
  GAME_STATUSES,
  VOLATILITY,
  NAV_ITEMS,
  BOTTOM_NAV_ITEMS,
  QUICK_DEPOSIT_AMOUNTS,
  QUICK_WITHDRAW_AMOUNTS,
  LIMITS,
  TOAST_DURATION,
  STORAGE_KEYS,
  DEFAULT_MESSAGES,
  SOCIAL_LINKS,
  SUPPORT,
  BREAKPOINTS,
  PAGINATION,
  IMAGE_PLACEHOLDERS,
  DATE_FORMATS,
};
