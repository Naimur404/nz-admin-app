import { AgentFilters, AgentListResponse, PartnerListResponse, AgentDetailsResponse } from '../types/agent';
import { apiClient } from './api';

class AgentService {
  async getAgents(filters: AgentFilters): Promise<AgentListResponse> {
    try {
      console.log('Agent list request filters:', filters);
      
      // Clean up filters - remove empty strings and null values
      const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      console.log('Cleaned filters for agent list:', cleanedFilters);

      const queryParams = new URLSearchParams(cleanedFilters).toString();
      const response = await apiClient.get(`/admin/agents?${queryParams}`);
      
      console.log('Agent list response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching agents:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  }

  async getAgentDetails(agentId: string): Promise<AgentDetailsResponse> {
    try {
      console.log('Fetching agent details for ID:', agentId);
      const response = await apiClient.get(`/admin/agents/${agentId}`);
      console.log('Agent details response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching agent details:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  }

  async getPartners(): Promise<PartnerListResponse> {
    try {
      console.log('Fetching partner list');
      const response = await apiClient.get('/partner-list');
      console.log('Partner list response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  }
}

export const agentService = new AgentService();