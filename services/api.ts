import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { authService } from './auth';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://nz-b2b-api-admin.laravel.cloud/api';

let authRedirectCallback: (() => void) | null = null;

export const setAuthRedirectCallback = (callback: () => void) => {
  authRedirectCallback = callback;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Check if we're in the middle of logging out
    if (authService.isLoggingOut && authService.isLoggingOut()) {
      console.log('Blocking API request during logout:', config.url);
      return Promise.reject(new Error('Request blocked during logout'));
    }
    
    const token = await SecureStore.getItemAsync('access_token');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Request URL:', `${API_BASE_URL}${config.url}`);
    console.log('Token retrieved:', token ? 'Token exists' : 'No token found');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - token expired or invalid
      console.log('Unauthorized access - token expired or invalid');
      console.log('Request URL:', error.config?.url);
      
      // Only handle 401 errors if we're not already logging out and not on login endpoint
      if (!authService.isLoggingOut || !authService.isLoggingOut()) {
        if (!error.config?.url?.includes('/auth/login')) {
          // Clear stored tokens (this will set the logout flag)
          await authService.logout();
          
          // Redirect to login if callback is set
          if (authRedirectCallback) {
            authRedirectCallback();
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export async function getAttractionBookingDetail(bookingTransId: string) {
  try {
    const response = await apiClient.get(`/attractions/bookings/${bookingTransId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}
