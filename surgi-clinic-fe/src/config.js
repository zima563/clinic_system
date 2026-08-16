// src/config.js

// API base URL - Relative URL for local Nginx Docker proxy, or custom VITE_API_URL environment variable
export const API_URL = import.meta.env.VITE_API_URL || "";

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
