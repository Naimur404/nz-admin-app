import { ProfileResponse } from '@/types/profile';
import { apiClient } from './api';

export const profileService = {
  async getUserProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiClient.get<ProfileResponse>('/auth/user-profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
};