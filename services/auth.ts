import * as SecureStore from 'expo-secure-store';
import { LoginPayload, LoginResponse } from '../types/auth';
import { apiClient } from './api';
import { clearTokens, getLoggingOut, setLoggingOut } from './auth-interceptors';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      setLoggingOut(false); // Reset logout flag on login
      const response = await apiClient.post<LoginResponse>('/auth/login', payload);
      
      // Store the token securely
      if (response.data.access_token) {
        await SecureStore.setItemAsync('access_token', response.data.access_token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await clearTokens();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (getLoggingOut()) {
        return null; // Return null if we're in the process of logging out
      }
      return await SecureStore.getItemAsync('access_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async getUser(): Promise<any | null> {
    try {
      if (getLoggingOut()) {
        return null; // Return null if we're in the process of logging out
      }
      const userData = await SecureStore.getItemAsync('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Method to check if we're currently logging out
  isLoggingOut(): boolean {
    return getLoggingOut();
  },

  // Method to reset logout state (useful for testing or if needed)
  resetLogoutState(): void {
    setLoggingOut(false);
  },
};
