import axios from 'axios';
import Constants from 'expo-constants';
import { requestInterceptor, responseInterceptor, setAuthRedirectCallback } from './auth-interceptors';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://nz-b2b-api-admin.laravel.cloud/api';

export { setAuthRedirectCallback };

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
  requestInterceptor,
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  responseInterceptor.success,
  responseInterceptor.error
);

export async function getAttractionBookingDetail(bookingTransId: string) {
  try {
    const response = await apiClient.get(`/attractions/bookings/${bookingTransId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}
