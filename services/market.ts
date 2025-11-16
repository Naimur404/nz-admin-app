import { MarketItem, MarketListResponse, OptionItem } from '@/types/common';
import { apiClient } from './api';

class MarketService {
  async getMarketList(perPage: number = 100): Promise<MarketItem[]> {
    try {
      const response = await apiClient.get<MarketListResponse>(`/admin/market-list?per_page=${perPage}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching market list:', error);
      throw error;
    }
  }

  async getMarketOptions(): Promise<OptionItem[]> {
    try {
      const markets = await this.getMarketList();
      return markets.map(market => ({
        label: `${market.market_name} (${market.currency_code})`,
        value: market.id,
      }));
    } catch (error) {
      console.error('Error getting market options:', error);
      return [];
    }
  }

  async getActiveMarketOptions(): Promise<OptionItem[]> {
    try {
      const markets = await this.getMarketList();
      const activeMarkets = markets.filter(market => market.is_active === 1);
      return activeMarkets.map(market => ({
        label: `${market.market_name} (${market.currency_code})`,
        value: market.id,
      }));
    } catch (error) {
      console.error('Error getting active market options:', error);
      return [];
    }
  }
}

export const marketService = new MarketService();