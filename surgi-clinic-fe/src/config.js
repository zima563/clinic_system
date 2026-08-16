// src/config.js

// API base URL
export const API_URL = "https://dcd6-41-45-22-208.ngrok-free.app"; // You can change this URL as needed

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


