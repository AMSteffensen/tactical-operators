import axios from 'axios';
import { getApiConfig } from './apiConfig';

// Create axios instance with dynamic configuration
const apiConfig = getApiConfig();
const api = axios.create({
  baseURL: apiConfig.authURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    createdAt: string;
  };
  token: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    username: string;
    createdAt: string;
  };
  token: string;
}

export const authService = {
  // Login user
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await api.post('/login', { email, password });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  },

  // Register new user
  async register(
    email: string,
    username: string,
    password: string
  ): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await api.post('/register', { email, username, password });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  },

  // Validate token (check if user is still authenticated)
  async validateToken(): Promise<ApiResponse<{ valid: boolean }>> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      // You could add a validate endpoint to the backend, 
      // for now we'll rely on the interceptor handling 401s
      return { success: true, data: { valid: true } };
    } catch (error: any) {
      return {
        success: false,
        error: 'Token validation failed',
      };
    }
  },
};
