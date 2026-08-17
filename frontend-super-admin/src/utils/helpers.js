import toast from 'react-hot-toast';

// ============================================================
// STRING HELPERS
// ============================================================

export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, length = 50, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

// ============================================================
// NUMBER HELPERS
// ============================================================

export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US');
};

export const formatCurrency = (amount, currency = 'THB') => {
  if (amount === undefined || amount === null || isNaN(amount)) return `${currency}0.00`;
  const formatted = Number(amount).toFixed(2);
  return `${currency}${formatNumber(formatted)}`;
};

// ============================================================
// DATE HELPERS
// ============================================================

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

export const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2419200) return `${Math.floor(diff / 604800)}w ago`;
  if (diff < 29030400) return `${Math.floor(diff / 2419200)}mo ago`;
  return `${Math.floor(diff / 29030400)}y ago`;
};

// ============================================================
// VALIDATION HELPERS
// ============================================================

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

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
// DOM HELPERS
// ============================================================

export const isMobile = () => window.innerWidth < 768;
export const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1024;
export const isDesktop = () => window.innerWidth >= 1024;

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
// DATA HELPERS
// ============================================================

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

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {
  capitalize,
  truncate,
  formatNumber,
  formatCurrency,
  formatDate,
  getRelativeTime,
  isEmpty,
  isValidEmail,
  isValidUrl,
  isMobile,
  isTablet,
  isDesktop,
  copyToClipboard,
  deepClone,
  groupBy,
  sortBy,
};
