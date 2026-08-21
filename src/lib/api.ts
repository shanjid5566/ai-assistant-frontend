import axios from 'axios';

// Create a generic axios instance for the frontend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Important for cookies/sessions if you use them after OAuth
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can also add request/response interceptors here in the future
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized -> redirect to login)
    return Promise.reject(error);
  }
);
