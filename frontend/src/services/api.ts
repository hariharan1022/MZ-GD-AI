import axios from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8003/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const detail = error.response.data?.detail;
      if (status === 401 || status === 403 || (status === 404 && (detail === "Student not found" || detail === "Admin not found"))) {
        localStorage.removeItem('token');
        localStorage.removeItem('current_student');
        window.location.href = (import.meta as any).env.BASE_URL || '/';
      }
    }
    return Promise.reject(error);
  }
);
