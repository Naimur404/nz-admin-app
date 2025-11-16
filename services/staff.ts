import { OptionItem, StaffItem, StaffListResponse } from '@/types/common';
import { apiClient } from './api';

class StaffService {
  async getStaffList(): Promise<StaffItem[]> {
    try {
      const response = await apiClient.get<StaffListResponse>('/staff-list');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching staff list:', error);
      throw error;
    }
  }

  async getStaffOptions(): Promise<OptionItem[]> {
    try {
      const staff = await this.getStaffList();
      return staff.map(member => ({
        label: `${member.name} (${member.email})`,
        value: member.id,
      }));
    } catch (error) {
      console.error('Error getting staff options:', error);
      return [];
    }
  }
}

export const staffService = new StaffService();