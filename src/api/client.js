import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : 'https://mbh-backend.onrender.com');

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Restore token on init
const storedToken = localStorage.getItem('agrix_token');
if (storedToken) {
  client.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrix_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;

export function getApiBaseDisplay() {
  return baseURL;
}

/** Origine pour Socket.IO (sans suffixe /api). */
export function getSocketOrigin() {
  return baseURL.replace(/\/api\/?$/i, '') || baseURL;
}
