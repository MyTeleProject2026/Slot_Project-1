// frontend-user/src/utils/helpers.js
// Small collection of frontend-safe utility helpers

export function tryParseJSON(str, defaultValue = null) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return defaultValue
  }
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function pick(obj = {}, keys = []) {
  if (!obj || typeof obj !== 'object') return {}
  return keys.reduce((acc, k) => {
    if (k in obj) acc[k] = obj[k]
    return acc
  }, {})
}

export function isEmpty(value) {
  if (value == null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  return false
}

export function parseIntOrDefault(value, defaultValue = 0) {
  const n = Number.parseInt(value, 10)
  return Number.isNaN(n) ? defaultValue : n
}

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Simple helper to safely read localStorage with JSON parse
export function readJsonStorage(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key)
    return tryParseJSON(raw, defaultValue)
  } catch (e) {
    return defaultValue
  }
}

export function writeJsonStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // ignore quota errors in browsers
  }
}
