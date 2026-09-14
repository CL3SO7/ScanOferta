const FAVORITES_KEY = 'oferta-radar:favorites'
const API_KEY = 'oferta-radar:urlscan-key'

export function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveFavorites(items) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items))
}

export function loadApiKey() {
  return localStorage.getItem(API_KEY) || ''
}

export function saveApiKey(value) {
  if (value) localStorage.setItem(API_KEY, value)
  else localStorage.removeItem(API_KEY)
}
