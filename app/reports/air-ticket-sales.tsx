import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/hooks/use-theme';
import { reportsService } from '../../services/reports';
import { AirTicketSalesReportItem, AirTicketSalesFilters } from '../../types/reports';
import { Skeleton, SkeletonList } from '@/components/ui/skeleton';

export default function AirTicketSalesReport() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State management
  const [data, setData] = useState<AirTicketSalesReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<AirTicketSalesFilters>({
    api_provider: '',
    booking_id_or_pnr: '',
    from_date: '',
    to_date: '',
    market_id: null,
    page: 1,
    per_page: 10,
  });

  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  useEffect(() => {
    // Check if we have authentication before loading data
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Check if we have a valid token first
      const token = await require('../../services/auth').authService.getToken();
      if (!token) {
        console.log('No token found for air ticket sales report');
        Alert.alert('Authentication Required', 'Please login to access reports.');
        return;
      }
      
      // Load data if we have a token
      loadReportData(true);
    } catch (error) {
      console.error('Auth check error for reports:', error);
      Alert.alert('Error', 'Authentication check failed. Please login again.');
    }
  };

  const loadReportData = async (reset = false) => {
    try {
      console.log('Loading air ticket sales report data, reset:', reset);
      
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      const pageToLoad = reset ? 1 : currentPage + 1;
      const filtersToSend = {
        ...filters,
        page: pageToLoad,
      };
      
      console.log('Air ticket sales report filters being sent:', filtersToSend);
      
      const response = await reportsService.getAirTicketSalesReport(filtersToSend);
      console.log('Air ticket sales report response:', response);

      if (response.flag) {
        if (reset) {
          setData(response.data);
        } else {
          setData(prev => [...prev, ...response.data]);
        }
        
        setTotalCount(response.dataCount);
        setCurrentPage(pageToLoad);
        setHasNextPage(pageToLoad < response.last_page);
      } else {
        console.warn('Air ticket sales report API returned flag: false');
        Alert.alert('Warning', 'No data available or request failed.');
      }
    } catch (error: any) {
      console.error('Error loading air ticket sales report:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Please login again to access reports.');
      } else if (error.response?.status === 403) {
        Alert.alert('Access Denied', 'You do not have permission to access this report.');
      } else if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Failed to load report data. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    loadReportData(true);
  };

  const handleReset = () => {
    setFilters({
      api_provider: '',
      booking_id_or_pnr: '',
      from_date: '',
      to_date: '',
      market_id: null,
      page: 1,
      per_page: 10,
    });
    setFromDate(null);
    setToDate(null);
    
    // Load data with reset filters
    setTimeout(() => {
      loadReportData(true);
    }, 100);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReportData(true);
  };

  const loadMoreData = () => {
    if (!loadingMore && hasNextPage) {
      loadReportData(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  };

  const getAirlineImageUrl = (carrierCode: string) => {
    return `https://s3.ap-southeast-1.amazonaws.com/cdn.nztrip.co/Airlineslogos/${carrierCode}.png`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFilters((prev: AirTicketSalesFilters) => ({ ...prev, from_date: formattedDate }));
    }
  };

  const handleToDateChange = (event: any, selectedDate?: Date) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFilters((prev: AirTicketSalesFilters) => ({ ...prev, to_date: formattedDate }));
    }
  };

  const renderReportItem = ({ item }: { item: AirTicketSalesReportItem }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}
      onPress={() => router.push(`/flight/booking-details?id=${item.booking_trans_id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.bookingInfo}>
          <Text style={[styles.bookingId, { color: isDark ? '#3b82f6' : '#1e40af' }]}>
            {item.booking_trans_id}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={[styles.issueDate, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          {formatDate(item.ticket_issue_date)}
        </Text>
      </View>

      <View style={styles.itemContent}>
        <View style={styles.routeInfo}>
          <View style={styles.routeContainer}>
            <Ionicons name="airplane-outline" size={16} color={isDark ? '#3b82f6' : '#1e40af'} />
            <Text style={[styles.routeText, { color: isDark ? '#f3f4f6' : '#333' }]}>
              {item.routes}
            </Text>
          </View>
          <View style={styles.airlineContainer}>
            {item.plating_carrier && (
              <Image
                source={{ uri: getAirlineImageUrl(item.plating_carrier) }}
                style={styles.airlineImage}
                resizeMode="contain"
              />
            )}
            <Text style={[styles.airlineText, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
              {item.airline_name} ({item.plating_carrier})
            </Text>
          </View>
        </View>

        <View style={styles.agentInfo}>
          <Text style={[styles.agentName, { color: isDark ? '#f3f4f6' : '#333' }]}>
            {item.agent_name}
          </Text>
          <Text style={[styles.agentSlNo, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            SL: {item.agent_sl_no}
          </Text>
        </View>

        <View style={styles.partnerInfo}>
          <Text style={[styles.partnerLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Partner:
          </Text>
          <Text style={[styles.partnerName, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
            {item.partner_name}
          </Text>
        </View>

        {item.airline_pnrs && (
          <View style={styles.pnrInfo}>
            <Text style={[styles.pnrLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              PNR:
            </Text>
            <Text style={[styles.pnrText, { color: isDark ? '#f59e0b' : '#d97706' }]}>
              {item.airline_pnrs}
            </Text>
          </View>
        )}

        {item.ticket_number && (
          <View style={styles.ticketInfo}>
            <Text style={[styles.ticketLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              Ticket:
            </Text>
            <Text style={[styles.ticketText, { color: isDark ? '#10b981' : '#059669' }]}>
              {item.ticket_number}
            </Text>
          </View>
        )}

        <View style={styles.paymentInfo}>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              Cost:
            </Text>
            <Text style={[styles.costAmount, { color: isDark ? '#f87171' : '#dc2626' }]}>
              {formatCurrency(item.total_price_buying, item.currency)}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              Selling:
            </Text>
            <Text style={[styles.sellingAmount, { color: isDark ? '#34d399' : '#059669' }]}>
              {formatCurrency(item.total_price_selling, item.currency)}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              Payable:
            </Text>
            <Text style={[styles.payableAmount, { color: isDark ? '#60a5fa' : '#2563eb' }]}>
              {formatCurrency(item.payable_amount, item.currency)}
            </Text>
          </View>
        </View>

        <View style={styles.processingInfo}>
          <Text style={[styles.processingLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Processing:
          </Text>
          <Text style={[styles.processingText, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
            {item.on_process || 'Not assigned'}
          </Text>
          {item.on_process_time && (
            <Text style={[styles.processingTime, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              {formatDate(item.on_process_time)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <View style={styles.loadingMoreContainer}>
          <Skeleton width={200} height={60} borderRadius={8} />
          <Skeleton width={250} height={60} borderRadius={8} style={{ marginTop: 8 }} />
        </View>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color={isDark ? '#4b5563' : '#9ca3af'} />
      <Text style={[styles.emptyTitle, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
        No reports found
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
          <Text style={styles.headerTitle}>Air Ticket Sales Report</Text>
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
                Booking ID/PNR
              </Text>
              <TextInput
                style={[styles.filterInput, { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  color: isDark ? '#f3f4f6' : '#1f2937',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}
                placeholder="Enter booking ID or PNR"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={filters.booking_id_or_pnr}
                onChangeText={(text) => setFilters((prev: AirTicketSalesFilters) => ({ ...prev, booking_id_or_pnr: text }))}
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                API Provider
              </Text>
              <TextInput
                style={[styles.filterInput, { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  color: isDark ? '#f3f4f6' : '#1f2937',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}
                placeholder="Enter API provider"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={filters.api_provider}
                onChangeText={(text) => setFilters((prev: AirTicketSalesFilters) => ({ ...prev, api_provider: text }))}
              />
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                From Date
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}
                onPress={() => setShowFromDatePicker(true)}
              >
                <Text style={[styles.dateButtonText, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                  {fromDate ? formatDate(fromDate.toISOString()) : 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
            </View>

            <View style={styles.dateItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                To Date
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}
                onPress={() => setShowToDatePicker(true)}
              >
                <Text style={[styles.dateButtonText, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                  {toDate ? formatDate(toDate.toISOString()) : 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actionButtons}>
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
          keyExtractor={(item) => `${item.id}-${item.booking_trans_id}`}
          renderItem={renderReportItem}
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

      {showFromDatePicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleFromDateChange}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleToDateChange}
        />
      )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    backgroundColor: '#1e40af',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButton: {
    width: 24,
    padding: 4,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  countContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  countText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  bookingInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
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
  issueDate: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  itemContent: {
    gap: 8,
  },
  routeInfo: {
    marginBottom: 4,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  airlineText: {
    fontSize: 14,
    color: '#4b5563',
  },
  airlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  airlineImage: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderRadius: 4,
  },
  agentInfo: {
    marginBottom: 4,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  agentSlNo: {
    fontSize: 12,
    color: '#6b7280',
  },
  partnerInfo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  partnerLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 6,
  },
  partnerName: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  pnrInfo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  pnrLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 6,
  },
  pnrText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '600',
  },
  ticketInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ticketLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 6,
  },
  ticketText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  paymentInfo: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  costAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  sellingAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  payableAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  processingInfo: {
    marginTop: 4,
  },
  processingLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  processingText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  processingTime: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  loadingFooter: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
    color: '#4b5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingMoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});