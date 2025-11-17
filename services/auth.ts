import * as SecureStore from 'expo-secure-store';
import { LoginPayload, LoginResponse } from '../types/auth';
import { apiClient } from './api';

// Flag to track logout state
let isLoggingOut = false;

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      isLoggingOut = false; // Reset logout flag on login
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
      isLoggingOut = true; // Set logout flag
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('user_data');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      // Keep the flag set even if logout fails to prevent API calls
      isLoggingOut = true;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (isLoggingOut) {
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
      if (isLoggingOut) {
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
    return isLoggingOut;
  },

  // Method to reset logout state (useful for testing or if needed)
  resetLogoutState(): void {
    isLoggingOut = false;
  },
};
