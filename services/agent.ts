import { AgentDetailsResponse, AgentFilters, AgentListResponse, PartnerListResponse } from '../types/agent';
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

  async updateOtpStatus(agentId: string, otpStatus: number): Promise<any> {
    try {
      console.log(`Updating OTP status for agent ${agentId} to ${otpStatus}`);
      const response = await apiClient.post('/admin/agent/otp-status', {
        agent_id: agentId,
        otp_status: otpStatus.toString()
      });
      console.log('OTP status update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating OTP status:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  }

  async updateAgentStatus(agentId: string, status: number): Promise<any> {
    try {
      console.log(`Updating agent status for ${agentId} to ${status}`);
      const response = await apiClient.post(`/admin/agents/${agentId}`, {
        status: status.toString()
      });
      console.log('Agent status update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating agent status:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  }

  async updateAgentMarkets(agentId: string, marketList: { id: number; status: number }[]): Promise<any> {
    try {
      console.log(`Updating markets for agent ${agentId}:`, marketList);
      const response = await apiClient.post(`/admin/allow-markets/${agentId}`, {
        market_list: marketList
      });
      console.log('Agent markets update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating agent markets:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  }

  async verifyAgentDocument(documentId: string, approval: number): Promise<any> {
    try {
      console.log(`Verifying document ${documentId} with approval ${approval}`);
      const response = await apiClient.post(`/admin/agents-document-verify/${documentId}`, {
        approval: approval
      });
      console.log('Document verification response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error verifying document:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  }
}

export const agentService = new AgentService();