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
    const token = await SecureStore.getItemAsync('access_token');
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
      
      // Clear stored tokens
      await authService.logout();
      
      // Redirect to login if callback is set
      if (authRedirectCallback) {
        authRedirectCallback();
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
