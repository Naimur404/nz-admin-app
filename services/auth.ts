import { apiClient } from './api';
import { LoginPayload, LoginResponse } from '../types/auth';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
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
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('user_data');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('access_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async getUser(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },
};
