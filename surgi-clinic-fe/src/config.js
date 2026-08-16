// src/config.js

// API base URL - relative path on local host (via Nginx SPA proxy), or environment variable / ngrok fallback
export const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : 'https://dcd6-41-45-22-208.ngrok-free.app'
);

// Function to get the stored token from localStorage
export const getToken = () => {
  const token = localStorage.getItem('token');
  return token;  // Always fetch the token when needed
};

// Function to clear the token and API URL from localStorage (e.g., for logout)
export const clearStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('apiUrl');
};
