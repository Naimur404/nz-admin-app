import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../hooks/use-theme';
import { agentService } from '../../services/agent';
import { marketService } from '../../services/market';
import { AgentFilters, AgentItem } from '../../types/agent';
import { OptionItem } from '../../types/common';
import { Skeleton, SkeletonList } from '@/components/ui/skeleton';

export default function AgentListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State management
  const [data, setData] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Options for dropdowns
  const [marketOptions, setMarketOptions] = useState<OptionItem[]>([]);
  const [partnerOptions, setPartnerOptions] = useState<OptionItem[]>([]);

  // Filter states
  const [filters, setFilters] = useState<AgentFilters>({
    status: '',
    agent_info: '',
    partner: '',
    market_id: '',
    agent_category: '',
    agent_type: '',
    verified_status: '',
    activity_status: '',
    page: 1,
    per_page: 15,
  });

  const styles = createStyles(isDark);

  // Load options on component mount
  useEffect(() => {
    loadOptions();
  }, []);

  // Load data when filters change
  useEffect(() => {
    loadData(true);
  }, [filters.status, filters.partner, filters.market_id, filters.agent_category, filters.agent_type, filters.verified_status, filters.activity_status]);

  const loadOptions = async () => {
    try {
      const [markets, partners] = await Promise.all([
        marketService.getActiveMarketOptions(),
        agentService.getPartners()
      ]);

      setMarketOptions(markets);
      setPartnerOptions(partners.data.map(p => ({ label: p.company_name, value: p.id })));
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const loadData = async (resetData = false, page = 1) => {
    try {
      if (resetData) {
        setLoading(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      const currentFilters = { ...filters, page };
      console.log('Loading agents with filters:', currentFilters);

      const response = await agentService.getAgents(currentFilters);

      if (resetData) {
        setData(response.data);
        setCurrentPage(1);
      } else {
        setData(prevData => [...prevData, ...response.data]);
      }

      setTotalCount(response.dataCount);
      setHasNextPage(response.current_page < response.last_page);
      setCurrentPage(response.current_page);

    } catch (error: any) {
      console.error('Error loading agents:', error);
      Alert.alert('Error', 'Failed to load agents. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadMoreData = () => {
    if (!loadingMore && hasNextPage) {
      loadData(false, currentPage + 1);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleSearch = () => {
    loadData(true);
  };

  const handleReset = () => {
    setFilters({
      status: '',
      agent_info: '',
      partner: '',
      market_id: '',
      agent_category: '',
      agent_type: '',
      verified_status: '',
      activity_status: '',
      page: 1,
      per_page: 15,
    });
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Approved';
      case 0: return 'Pending';
      case -1: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return '#10b981'; // green
      case 0: return '#f59e0b'; // yellow
      case -1: return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getAgentCategoryText = (category: number) => {
    switch (category) {
      case 1: return 'IATA';
      case 2: return 'Non-IATA';
      case 3: return 'Freelancer';
      default: return 'Unknown';
    }
  };

  const getAgentTypeText = (type: number) => {
    switch (type) {
      case 1: return 'In House';
      case 2: return 'B2B Agent';
      case 3: return 'API User';
      default: return 'Unknown';
    }
  };

  const getVerifiedStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Verified';
      case 0: return 'Pending';
      default: return 'Unknown';
    }
  };

  const getActivityStatusText = (status: number) => {
    return status === 1 ? 'Active' : 'Inactive';
  };

  const getOtpStatusText = (status: number) => {
    return status === 1 ? 'Enabled' : 'Disabled';
  };

  const formatCurrency = (amount: string, currency: string) => {
    return `${amount} ${currency}`;
  };

  const renderAgentItem = ({ item }: { item: AgentItem }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}
      onPress={() => {
        // Navigate to agent details
        router.push(`/agents/${item.id}` as any);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.agentInfo}>
          <Text style={[styles.agentName, { color: isDark ? '#3b82f6' : '#1e40af' }]}>
            {item.company_name}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
              <Text style={[styles.categoryText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                {getAgentCategoryText(item.agent_category)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.joinDate, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          {item.join_date}
        </Text>
      </View>

      <View style={styles.itemContent}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            SL No:
          </Text>
          <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
            {item.sl_no}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Email:
          </Text>
          <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
            {item.email}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Contact:
          </Text>
          <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
            {item.contact_person} - {item.contact_number}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Market:
          </Text>
          <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
            {item.available_markets.length > 0 ? item.available_markets[0].market_name : 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Country:
          </Text>
          <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
            {item.country.country_name}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Balance:
          </Text>
          <Text style={[styles.balanceAmount, { color: isDark ? '#34d399' : '#059669' }]}>
            {formatCurrency(item.balance, item.currency)}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={[styles.statusItemLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              OTP Status:
            </Text>
            <Text style={[styles.statusItemValue, { 
              color: item.otp_status === 1 ? '#10b981' : '#ef4444'
            }]}>
              {getOtpStatusText(item.otp_status)}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusItemLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              Activity:
            </Text>
            <Text style={[styles.statusItemValue, { 
              color: item.activity === 1 ? '#10b981' : '#ef4444'
            }]}>
              {getActivityStatusText(item.activity)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={isDark ? '#3b82f6' : '#1e40af'} />
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={isDark ? '#4b5563' : '#9ca3af'} />
      <Text style={[styles.emptyTitle, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
        No agents found
      </Text>
      <Text style={[styles.emptySubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
        Try adjusting your filters or check back later
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]} edges={['top']}>
          <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Agent List</Text>
            <TouchableOpacity
              style={styles.filterToggle}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons
                name={showFilters ? 'close-circle' : 'filter'}
                size={24}
                color="#fff"
              />
              <Text style={styles.filterToggleText}>
                {showFilters ? 'Close' : 'Filters'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        
        {showFilters && (
          <View style={[styles.filtersContainer, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Agent Info
                </Text>
                <TextInput
                  style={[styles.filterInput, { 
                    backgroundColor: isDark ? '#374151' : '#f9fafb',
                    color: isDark ? '#f3f4f6' : '#1f2937',
                    borderColor: isDark ? '#4b5563' : '#d1d5db'
                  }]}
                  value={filters.agent_info}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, agent_info: text }))}
                  placeholder="Search agent info..."
                  placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                />
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Status
                </Text>
                <View style={[styles.pickerContainer, { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}>
                  <Picker
                    selectedValue={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    style={[styles.picker, { color: isDark ? '#f3f4f6' : '#1f2937' }]}
                    dropdownIconColor={isDark ? '#9ca3af' : '#6b7280'}
                  >
                    <Picker.Item label="All Status" value="" />
                    <Picker.Item label="Approved" value="1" />
                    <Picker.Item label="Pending" value="0" />
                    <Picker.Item label="Rejected" value="-1" />
                  </Picker>
                </View>
              </View>

              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Partner
                </Text>
                <View style={[styles.pickerContainer, { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}>
                  <Picker
                    selectedValue={filters.partner}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, partner: value }))}
                    style={[styles.picker, { color: isDark ? '#f3f4f6' : '#1f2937' }]}
                    dropdownIconColor={isDark ? '#9ca3af' : '#6b7280'}
                  >
                    <Picker.Item label="All Partners" value="" />
                    {partnerOptions.map(option => (
                      <Picker.Item key={option.value} label={option.label} value={option.value.toString()} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Market
                </Text>
                <View style={[styles.pickerContainer, { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}>
                  <Picker
                    selectedValue={filters.market_id}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, market_id: value }))}
                    style={[styles.picker, { color: isDark ? '#f3f4f6' : '#1f2937' }]}
                    dropdownIconColor={isDark ? '#9ca3af' : '#6b7280'}
                  >
                    <Picker.Item label="All Markets" value="" />
                    {marketOptions.map(option => (
                      <Picker.Item key={option.value} label={option.label} value={option.value.toString()} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Agent Category
                </Text>
                <View style={[styles.pickerContainer, { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}>
                  <Picker
                    selectedValue={filters.agent_category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, agent_category: value }))}
                    style={[styles.picker, { color: isDark ? '#f3f4f6' : '#1f2937' }]}
                    dropdownIconColor={isDark ? '#9ca3af' : '#6b7280'}
                  >
                    <Picker.Item label="All Categories" value="" />
                    <Picker.Item label="IATA" value="1" />
                    <Picker.Item label="Non-IATA" value="2" />
                    <Picker.Item label="Freelancer" value="3" />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Agent Type
                </Text>
                <View style={[styles.pickerContainer, { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}>
                  <Picker
                    selectedValue={filters.agent_type}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, agent_type: value }))}
                    style={[styles.picker, { color: isDark ? '#f3f4f6' : '#1f2937' }]}
                    dropdownIconColor={isDark ? '#9ca3af' : '#6b7280'}
                  >
                    <Picker.Item label="All Types" value="" />
                    <Picker.Item label="In House" value="1" />
                    <Picker.Item label="B2B Agent" value="2" />
                    <Picker.Item label="API User" value="3" />
                  </Picker>
                </View>
              </View>

              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Verified Status
                </Text>
                <View style={[styles.pickerContainer, { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}>
                  <Picker
                    selectedValue={filters.verified_status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, verified_status: value }))}
                    style={[styles.picker, { color: isDark ? '#f3f4f6' : '#1f2937' }]}
                    dropdownIconColor={isDark ? '#9ca3af' : '#6b7280'}
                  >
                    <Picker.Item label="All Verified Status" value="" />
                    <Picker.Item label="Verified" value="1" />
                    <Picker.Item label="Pending" value="0" />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Activity Status
                </Text>
                <View style={[styles.pickerContainer, { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}>
                  <Picker
                    selectedValue={filters.activity_status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, activity_status: value }))}
                    style={[styles.picker, { color: isDark ? '#f3f4f6' : '#1f2937' }]}
                    dropdownIconColor={isDark ? '#9ca3af' : '#6b7280'}
                  >
                    <Picker.Item label="All Activity Status" value="" />
                    <Picker.Item label="Active" value="1" />
                    <Picker.Item label="Inactive" value="0" />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={[styles.searchButton, { backgroundColor: isDark ? '#3b82f6' : '#1e40af' }]}
                onPress={handleSearch}
                disabled={loading}
              >
                <Ionicons name="search" size={16} color="#fff" />
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.resetButton, {
                  backgroundColor: isDark ? '#4b5563' : '#6b7280',
                  borderColor: isDark ? '#6b7280' : '#9ca3af'
                }]}
                onPress={handleReset}
                disabled={loading}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!loading && !refreshing ? (
          <View style={[styles.countContainer, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <Text style={[styles.countText, { color: isDark ? '#d1d5db' : '#374151' }]}>
              Showing {data.length} of {totalCount} results
            </Text>
          </View>
        ) : loading ? (
          <View style={[styles.countContainer, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <Skeleton width="60%" height={16} />
          </View>
        ) : null}

        {loading ? (
          <SkeletonList itemCount={6} />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => `${item.id}-${item.sl_no}`}
            renderItem={renderAgentItem}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.1}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[isDark ? '#3b82f6' : '#1e40af']}
                tintColor={isDark ? '#3b82f6' : '#1e40af'}
              />
            }
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={[
              styles.listContainer,
              data.length === 0 && styles.emptyListContainer
            ]}
          />
        )}
      </View>
    </>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#f5f5f5',
  },
  safeArea: {
    backgroundColor: isDark ? '#1f2937' : '#1e40af',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? '#1f2937' : '#1e40af',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  filterToggleText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#e5e7eb',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: isDark ? '#d1d5db' : '#374151',
  },
  filterInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: isDark ? '#374151' : '#f9fafb',
    borderColor: isDark ? '#4b5563' : '#d1d5db',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: isDark ? '#374151' : '#f9fafb',
    borderColor: isDark ? '#4b5563' : '#d1d5db',
  },
  picker: {
    color: isDark ? '#f3f4f6' : '#1f2937',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: isDark ? '#3b82f6' : '#1e40af',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: isDark ? '#4b5563' : '#6b7280',
    borderColor: isDark ? '#6b7280' : '#9ca3af',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  countContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#e5e7eb',
  },
  countText: {
    fontSize: 14,
    color: isDark ? '#d1d5db' : '#374151',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: isDark ? '#1f2937' : '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  agentInfo: {
    flex: 1,
    marginRight: 12,
  },
  agentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#3b82f6' : '#1e40af',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: isDark ? '#d1d5db' : '#374151',
  },
  joinDate: {
    fontSize: 12,
    color: isDark ? '#9ca3af' : '#6b7280',
    textAlign: 'right',
  },
  itemContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#f3f4f6' : '#1f2937',
    flex: 2,
    textAlign: 'right',
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#374151' : '#e5e7eb',
  },
  statusItem: {
    flex: 1,
  },
  statusItemLabel: {
    fontSize: 12,
    color: isDark ? '#9ca3af' : '#6b7280',
    marginBottom: 2,
  },
  statusItemValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#d1d5db' : '#4b5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    textAlign: 'center',
  },
  loadingFooter: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});