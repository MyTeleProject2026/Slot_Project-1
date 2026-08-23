// ============================================================
// N999Bet – APPLICATION CONSTANTS
// ============================================================

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'N999Bet';
export const APP_VERSION = '2.1.0';

// N999Bet is deployed for Myanmar. Country/currency can still be
// supplied by the backend/Super Admin and selected at runtime.
export const DEFAULT_COUNTRY = {
  code: 'MM',
  name: 'Myanmar',
  currency: 'MMK',
  currencySymbol: 'K',
  locale: 'my-MM',
  timezone: 'Asia/Yangon'
};

export const SUPPORTED_COUNTRIES = [
  { code: 'MM', name: 'Myanmar', currency: 'MMK', currencySymbol: 'K', locale: 'my-MM', timezone: 'Asia/Yangon' },
  { code: 'TH', name: 'Thailand', currency: 'THB', currencySymbol: '฿', locale: 'th-TH', timezone: 'Asia/Bangkok' },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', currencySymbol: 'RM', locale: 'ms-MY' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', currencySymbol: 'S$', locale: 'en-SG' },
  { code: 'ID', name: 'Indonesia', currency: 'IDR', currencySymbol: 'Rp', locale: 'id-ID' },
  { code: 'PH', name: 'Philippines', currency: 'PHP', currencySymbol: '₱', locale: 'en-PH' },
  { code: 'VN', name: 'Vietnam', currency: 'VND', currencySymbol: '₫', locale: 'vi-VN' },
];

let currentCountry = { ...DEFAULT_COUNTRY };
export const getCurrentCountry = () => currentCountry;
export const setCurrentCountry = (country) => {
  if (country && country.code && country.currency) {
    currentCountry = { ...DEFAULT_COUNTRY, ...country };
    localStorage.setItem('n999bet_country', JSON.stringify(currentCountry));
  }
};

try {
  const saved = localStorage.getItem('n999bet_country');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed?.code && parsed?.currency) currentCountry = { ...DEFAULT_COUNTRY, ...parsed };
  }
} catch (e) {}

export const CURRENCY = () => getCurrentCountry().currency || DEFAULT_COUNTRY.currency;
export const CURRENCY_SYMBOL = () => getCurrentCountry().currencySymbol || DEFAULT_COUNTRY.currencySymbol;

export const GAME_CATEGORIES = [
  { id: 'slots', name: 'Slots', icon: '🎰', path: '/games/slots' },
  { id: 'live', name: 'Live Casino', icon: '🎲', path: '/games/live-casino' },
  { id: 'sports', name: 'Sports', icon: '⚽', path: '/games/sports' },
  { id: 'fishing', name: 'Fishing', icon: '🎣', path: '/games/fishing' },
  { id: 'lotto', name: 'Lotto', icon: '🎱', path: '/games/lotto' },
];

export const PAYMENT_METHODS = [
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
  { id: 'crypto', name: 'Cryptocurrency', icon: '₿' },
  { id: 'e_wallet', name: 'E-Wallet', icon: '📱' },
];

export const TRANSACTION_TYPES = { DEPOSIT:'deposit', WITHDRAW:'withdraw', BONUS:'bonus', COMMISSION:'commission', BET:'bet', WIN:'win', REFUND:'refund', ADJUSTMENT:'adjustment' };
export const TRANSACTION_STATUSES = { PENDING:'pending', APPROVED:'approved', REJECTED:'rejected', COMPLETED:'completed', FAILED:'failed', CANCELLED:'cancelled' };
export const WALLET_TYPES = { MAIN:'main', BONUS:'bonus', COMMISSION:'commission', LOCKED:'locked' };
export const USER_ROLES = { USER:'user', EMPLOYEE:'employee', ADMIN:'admin', SUPER_ADMIN:'super_admin', MAIN_ADMIN:'main_admin' };
export const USER_STATUSES = { ACTIVE:'active', SUSPENDED:'suspended', BLOCKED:'blocked', PENDING:'pending' };
export const GAME_STATUSES = { ACTIVE:'active', MAINTENANCE:'maintenance', DISABLED:'disabled' };
export const VOLATILITY = { LOW:'low', MEDIUM:'medium', HIGH:'high', VERY_HIGH:'very-high' };
export const NAV_ITEMS = [
  { path:'/', label:'Home', icon:'FaHome' }, { path:'/games', label:'Games', icon:'FaGamepad' },
  { path:'/promotions', label:'Promotions', icon:'FaGift' }, { path:'/wallet', label:'Wallet', icon:'FaWallet' },
  { path:'/profile', label:'Profile', icon:'FaUser' },
];
export const BOTTOM_NAV_ITEMS = [
  { path:'/', label:'Home', icon:'FaHome' }, { path:'/games', label:'Games', icon:'FaGamepad' },
  { path:'/promotions', label:'Promos', icon:'FaGift' }, { path:'/wallet', label:'Wallet', icon:'FaWallet' },
  { path:'/profile', label:'Profile', icon:'FaUser' },
];

// These are UI suggestions only. Authoritative limits should come from
// Super Admin/backend country settings.
export const QUICK_DEPOSIT_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];
export const QUICK_WITHDRAW_AMOUNTS = [5000, 10000, 25000, 50000, 100000, 200000];
export const LIMITS = { MIN_DEPOSIT:1000, MAX_DEPOSIT:10000000, MIN_WITHDRAW:5000, MAX_WITHDRAW:5000000, MIN_BET:1, MAX_BET:100000 };
export const TOAST_DURATION = { SHORT:2000, MEDIUM:3000, LONG:5000 };
export const STORAGE_KEYS = { TOKEN:'token', REFRESH_TOKEN:'refreshToken', USER:'user', THEME:'theme', FAVORITES:'favorites', LANGUAGE:'language', COUNTRY:'n999bet_country' };
export const DEFAULT_MESSAGES = { LOADING:'Loading...', NO_DATA:'No data available', ERROR:'Something went wrong. Please try again.', SUCCESS:'Operation completed successfully.', UNAUTHORIZED:'Please login to continue.', NETWORK_ERROR:'Network error. Please check your connection.' };
export const SOCIAL_LINKS = { FACEBOOK:'https://www.facebook.com/n999bet', INSTAGRAM:'https://www.instagram.com/n999bet', YOUTUBE:'https://www.youtube.com/n999bet', TELEGRAM:'https://t.me/n999bet', WHATSAPP:'https://wa.me/yournumber' };
export const SUPPORT = { EMAIL:'support@n999bet.com', PHONE:'+95 9 000 000 000', WHATSAPP:'https://wa.me/yournumber', TELEGRAM:'https://t.me/n999bet' };
export const BREAKPOINTS = { SM:640, MD:768, LG:1024, XL:1280, XXL:1536 };
export const PAGINATION = { DEFAULT_PAGE:1, DEFAULT_LIMIT:20, DEFAULT_LIMITS:[10,20,50,100] };
export const IMAGE_PLACEHOLDERS = { GAME:'/assets/images/placeholder-game.png', PROVIDER:'/assets/images/placeholder-provider.png', AVATAR:'/assets/images/placeholder-avatar.png', BANNER:'/assets/images/placeholder-banner.png' };
export const DATE_FORMATS = { DISPLAY:'MMM DD, YYYY', DISPLAY_TIME:'MMM DD, YYYY HH:mm', API:'YYYY-MM-DD', API_TIME:'YYYY-MM-DDTHH:mm:ss.SSSZ', TIME_ONLY:'HH:mm' };

export default { API_URL, APP_NAME, APP_VERSION, CURRENCY, CURRENCY_SYMBOL, GAME_CATEGORIES, PAYMENT_METHODS, TRANSACTION_TYPES, TRANSACTION_STATUSES, WALLET_TYPES, USER_ROLES, USER_STATUSES, GAME_STATUSES, VOLATILITY, NAV_ITEMS, BOTTOM_NAV_ITEMS, QUICK_DEPOSIT_AMOUNTS, QUICK_WITHDRAW_AMOUNTS, LIMITS, TOAST_DURATION, STORAGE_KEYS, DEFAULT_MESSAGES, SOCIAL_LINKS, SUPPORT, BREAKPOINTS, PAGINATION, IMAGE_PLACEHOLDERS, DATE_FORMATS, DEFAULT_COUNTRY, SUPPORTED_COUNTRIES, getCurrentCountry, setCurrentCountry };
