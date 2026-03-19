// API Configuration for Wallex Frontend

// Development API URL
const DEV_API_URL = 'http://localhost:3000';

// Production API URL (update with your Render URL)
const PROD_API_URL = 'https://wallex-api.onrender.com';

// Determine API URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? PROD_API_URL : DEV_API_URL);

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default apiConfig;
