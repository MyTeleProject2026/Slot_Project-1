import toast from 'react-hot-toast';
import { CURRENCY, CURRENCY_SYMBOL, LIMITS } from './constants';

// ============================================================
// STRING HELPERS
// ============================================================

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate a string to a specified length
 */
export const truncate = (str, length = 50, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

/**
 * Generate a random string
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Slugify a string (for URLs)
 */
export const slugify = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ============================================================
// NUMBER HELPERS
// ============================================================

/**
 * Format a number with commas (e.g., 1,000,000)
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US');
};

/**
 * Format currency (THB)
 */
export const formatCurrency = (amount, currency = CURRENCY, symbol = CURRENCY_SYMBOL) => {
  if (amount === undefined || amount === null || isNaN(amount)) return `${symbol}0.00`;
  const formatted = Number(amount).toFixed(2);
  return `${symbol}${formatNumber(formatted)}`;
};

/**
 * Format currency without symbol
 */
export const formatCurrencyPlain = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
  return Number(amount).toFixed(2);
};

/**
 * Parse a number from a string (removes commas, currency symbols, etc.)
 */
export const parseNumber = (value) => {
  if (!value && value !== 0) return 0;
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Clamp a number between min and max
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Check if a number is within range
 */
export const isWithinRange = (value, min, max) => {
  return value >= min && value <= max;
};

// ============================================================
// DATE & TIME HELPERS
// ============================================================

/**
 * Format a date string
 */
export const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const replacements = {
    'YYYY': d.getFullYear(),
    'YY': String(d.getFullYear()).slice(2),
    'MMM': months[d.getMonth()],
    'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'M': d.getMonth() + 1,
    'DD': String(d.getDate()).padStart(2, '0'),
    'D': d.getDate(),
    'ddd': days[d.getDay()],
    'HH': String(d.getHours()).padStart(2, '0'),
    'H': d.getHours(),
    'mm': String(d.getMinutes()).padStart(2, '0'),
    'ss': String(d.getSeconds()).padStart(2, '0'),
  };
  let result = format;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), String(value));
  }
  return result;
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  const now = new Date();
  const diff = Math.floor((now - d) / 1000); // seconds
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2419200) return `${Math.floor(diff / 604800)} weeks ago`;
  if (diff < 29030400) return `${Math.floor(diff / 2419200)} months ago`;
  return `${Math.floor(diff / 29030400)} years ago`;
};

/**
 * Check if a date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

/**
 * Check if a date is in the past
 */
export const isPast = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Check if a value is a valid email
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Check if a value is a valid phone number
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  return /^[0-9+\-()\s]{8,20}$/.test(phone);
};

/**
 * Check if a value is a valid username
 */
export const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
};

/**
 * Check if a value is a valid password (min 8 chars, at least one uppercase, one lowercase, one number)
 */
export const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /\d/.test(password);
};

/**
 * Check if a value is a valid URL
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ============================================================
// DOM & BROWSER HELPERS
// ============================================================

/**
 * Check if the device is mobile
 */
export const isMobile = () => {
  return window.innerWidth < 768;
};

/**
 * Check if the device is tablet
 */
export const isTablet = () => {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

/**
 * Check if the device is desktop
 */
export const isDesktop = () => {
  return window.innerWidth >= 1024;
};

/**
 * Get device type
 */
export const getDeviceType = () => {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};

/**
 * Scroll to top of page smoothly
 */
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    toast.error('Failed to copy');
    return false;
  }
};

// ============================================================
// DATA & OBJECT HELPERS
// ============================================================

/**
 * Deep clone an object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

/**
 * Get nested object value using dot notation
 */
export const getNestedValue = (obj, path, defaultValue = undefined) => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  const keys = Array.isArray(path) ? path : path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  return current !== undefined ? current : defaultValue;
};

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  if (!array || !Array.isArray(array)) return {};
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 */
export const sortBy = (array, key, ascending = true) => {
  if (!array || !Array.isArray(array)) return [];
  const sorted = [...array];
  sorted.sort((a, b) => {
    let aVal = typeof key === 'function' ? key(a) : a[key];
    let bVal = typeof key === 'function' ? key(b) : b[key];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
  return sorted;
};

/**
 * Debounce a function
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle a function
 */
export const throttle = (fn, delay = 300) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
};

// ============================================================
// ROUTE HELPERS
// ============================================================

/**
 * Get route path with query parameters
 */
export const buildRoute = (path, params) => {
  if (!params || Object.keys(params).length === 0) return path;
  const query = new URLSearchParams(params).toString();
  return `${path}?${query}`;
};

/**
 * Extract query parameters from URL
 */
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

// ============================================================
// GAME HELPERS
// ============================================================

/**
 * Get game status label with color
 */
export const getGameStatusColor = (status) => {
  const map = {
    active: 'bg-green-500',
    maintenance: 'bg-yellow-500',
    disabled: 'bg-red-500',
  };
  return map[status] || 'bg-gray-500';
};

/**
 * Get volatility label and color
 */
export const getVolatilityInfo = (volatility) => {
  const map = {
    low: { label: 'Low', color: 'text-green-500' },
    medium: { label: 'Medium', color: 'text-yellow-500' },
    high: { label: 'High', color: 'text-orange-500' },
    'very-high': { label: 'Very High', color: 'text-red-500' },
  };
  return map[volatility] || { label: volatility || 'N/A', color: 'text-gray-500' };
};

/**
 * Format RTP value
 */
export const formatRTP = (rtp) => {
  if (rtp === undefined || rtp === null) return 'N/A';
  const num = typeof rtp === 'string' ? parseFloat(rtp) : rtp;
  if (isNaN(num)) return 'N/A';
  return `${num.toFixed(2)}%`;
};

// ============================================================
// TRANSACTION HELPERS
// ============================================================

/**
 * Get transaction type label
 */
export const getTransactionTypeLabel = (type) => {
  const map = {
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    bonus: 'Bonus',
    commission: 'Commission',
    bet: 'Bet',
    win: 'Win',
    refund: 'Refund',
    adjustment: 'Adjustment',
  };
  return map[type] || type || 'Unknown';
};

/**
 * Get transaction status color
 */
export const getTransactionStatusColor = (status) => {
  const map = {
    pending: 'text-yellow-500',
    approved: 'text-blue-500',
    rejected: 'text-red-500',
    completed: 'text-green-500',
    failed: 'text-red-500',
    cancelled: 'text-gray-500',
  };
  return map[status] || 'text-gray-500';
};

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {
  // String helpers
  capitalize,
  truncate,
  generateRandomString,
  slugify,
  // Number helpers
  formatNumber,
  formatCurrency,
  formatCurrencyPlain,
  parseNumber,
  clamp,
  isWithinRange,
  // Date helpers
  formatDate,
  getRelativeTime,
  isToday,
  isPast,
  // Validation
  isEmpty,
  isValidEmail,
  isValidPhone,
  isValidUsername,
  isValidPassword,
  isValidUrl,
  // DOM helpers
  isMobile,
  isTablet,
  isDesktop,
  getDeviceType,
  scrollToTop,
  copyToClipboard,
  // Data helpers
  deepClone,
  getNestedValue,
  groupBy,
  sortBy,
  debounce,
  throttle,
  // Route helpers
  buildRoute,
  getQueryParams,
  // Game helpers
  getGameStatusColor,
  getVolatilityInfo,
  formatRTP,
  // Transaction helpers
  getTransactionTypeLabel,
  getTransactionStatusColor,
};
