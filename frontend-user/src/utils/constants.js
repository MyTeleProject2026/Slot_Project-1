// frontend-user/src/utils/constants.js

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const APP_NAME = 'Slot Project'
export const DEFAULT_THEME = 'light'
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
}

export const STORAGE_KEYS = {
  AUTH_USER: 'auth_user',
  AUTH_TOKEN: 'auth_token',
}
