import { useTheme } from '@/hooks/use-theme';
import { bookingStatusService } from '@/services/booking-status';
import { hotelService } from '@/services/hotel';
import { HotelBooking, HotelBookingFilters } from '@/types/hotel';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonList } from '@/components/ui/skeleton';

export default function HotelBookingsScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [statusOptions, setStatusOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
  });

  // Filter states
  const [filters, setFilters] = useState<HotelBookingFilters>(() => {
    // Get today's date in local timezone
    const today = new Date();
    const localDate = today.toISOString().split('T')[0];
    
    return {
      from_date: localDate, // Default to today's date
      to_date: localDate,   // Default to today's date
      booking_id_or_pnr: '',
      api_id: '',
      staff_id: '',
      status: '',
      page: 1,
      per_page: 10,
      platform_type: '',
      agent_sl_or_name: '',
    };
  });

  useEffect(() => {
    loadBookingStatuses();
    loadBookings(); // Load bookings with initial filters (today's date)
  }, []);

  const loadBookingStatuses = async () => {
    try {
      const statusData = await bookingStatusService.getBookingStatuses();
      const options = bookingStatusService.getStatusOptions(statusData);
      setStatusOptions(options);
    } catch (error) {
      Alert.alert('Error', 'Failed to load booking statuses');
    }
  };

  const loadBookings = async (isLoadMore = false) => {
    await loadBookingsWithFilters(filters, isLoadMore);
  };

  const handleSearch = () => {
    // Reset pagination and clear bookings for new search
    setBookings([]);
    setPagination({
      total: 0,
      currentPage: 1,
      lastPage: 1,
      perPage: 10,
    });
    
    // Load bookings with current filters
    const searchFilters = { ...filters, page: 1 };
    setFilters(searchFilters);
    loadBookingsWithFilters(searchFilters);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && pagination.currentPage < pagination.lastPage) {
      // Don't update filters state, just pass the next page directly
      const nextPage = pagination.currentPage + 1;
      const loadMoreFilters = { ...filters, page: nextPage };
      loadBookingsWithFilters(loadMoreFilters, true); // Load more data with next page
    }
  };

  const handleReset = () => {
    const resetFilters = {
      from_date: '', // Clear dates so user can select any date range
      to_date: '',   // Clear dates so user can select any date range
      booking_id_or_pnr: '',
      api_id: '',
      staff_id: '',
      status: '',
      page: 1,
      per_page: 10,
      platform_type: '',
      agent_sl_or_name: '',
    };
    
    // Clear existing bookings and reset pagination immediately
    setBookings([]);
    setPagination({
      total: 0,
      currentPage: 1,
      lastPage: 1,
      perPage: 10,
    });
    
    // Update filters and load bookings with reset filters
    setFilters(resetFilters);
    
    // Automatically search with empty filters to show all data
    loadBookingsWithFilters(resetFilters);
  };

  // Helper function to load bookings with specific filters
  const loadBookingsWithFilters = async (filterParams: HotelBookingFilters, isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const requestParams = {
        ...filterParams,
        page: isLoadMore ? pagination.currentPage + 1 : filterParams.page,
      };
      
      const response = await hotelService.getBookings(requestParams);
      
      if (isLoadMore) {
        // Append new data to existing bookings, avoiding duplicates
        setBookings(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newBookings = response.data.filter((item: HotelBooking) => !existingIds.has(item.id));
          return [...prev, ...newBookings];
        });
      } else {
        // Replace with new data (for search/filter)
        setBookings(response.data);
      }
      
      setPagination({
        total: response.dataCount,
        currentPage: response.current_page,
        lastPage: response.last_page,
        perPage: response.to - response.from + 1,
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return { backgroundColor: '#10b981' };
      case 'CANCELLED':
      case 'VOID':
        return { backgroundColor: '#ef4444' };
      case 'FAILED':
        return { backgroundColor: '#f59e0b' };
      case 'PENDING':
        return { backgroundColor: '#6b7280' };
      default:
        return { backgroundColor: '#6b7280' };
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'B2B':
        return { backgroundColor: '#3b82f6' };
      case 'B2C':
        return { backgroundColor: '#8b5cf6' };
      default:
        return { backgroundColor: '#6b7280' };
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'EAN':
        return { backgroundColor: '#8b5cf6' }; // Purple
      case 'EXPEDIA':
        return { backgroundColor: '#f59e0b' }; // Orange
      case 'BOOKING':
        return { backgroundColor: '#06b6d4' }; // Cyan
      case 'AGODA':
        return { backgroundColor: '#ef4444' }; // Red
      default:
        return { backgroundColor: '#3b82f6' }; // Blue
    }
  };

  const onFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFilters({ ...filters, from_date: formattedDate });
      // Don't auto-search, wait for user to click search button
    }
  };

  const onToDateChange = (event: any, selectedDate?: Date) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFilters({ ...filters, to_date: formattedDate });
      // Don't auto-search, wait for user to click search button
    }
  };

  const renderBookingItem = ({ item }: { item: HotelBooking }) => (
    <TouchableOpacity 
      style={[styles.bookingCard, { 
        backgroundColor: isDark ? '#1f2937' : '#fff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        shadowColor: isDark ? '#000' : '#000'
      }]}
      onPress={() => router.push({ pathname: '/hotel/booking-details', params: { transactionId: item.unique_trans_id } })}
    >
      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Booking Date:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{formatDate(item.booking_date)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Agent Name:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]} numberOfLines={2}>
          {item.agent_name}({item.agent_sl_no})
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Booking ID:</Text>
        <View style={[styles.bookingIdBadge, { backgroundColor: isDark ? '#3b82f6' : '#1e40af' }]}>
          <Text style={[styles.bookingIdText, { color: '#fff' }]}>{item.unique_trans_id}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Brand:</Text>
        <View style={[styles.brandBadge, getBrandColor(item.api_name)]}>
          <Text style={styles.brandText}>{item.api_name}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Cost:</Text>
        <Text style={[styles.value, styles.profit, { color: isDark ? '#10b981' : '#059669' }]}>
          {item.currency} {parseFloat(item.total_price_selling).toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Payment:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{item.payment_method}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Platform Type:</Text>
        <View style={[styles.platformBadge, getPlatformColor(item.platform_type)]}>
          <Text style={styles.platformText}>{item.platform_type}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Status:</Text>
        <View style={[styles.statusBadge, getStatusColor(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Check In:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{formatDate(item.check_in)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Check Out:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{formatDate(item.check_out)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>Hotel Bookings</Text>
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={[styles.filterToggleText, { color: '#fff' }]}>Filters</Text>
            <Ionicons
              name={showFilters ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {showFilters && (
        <View style={[styles.filterContainer, { backgroundColor: isDark ? '#1f2937' : '#f8f9fa', borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]}>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>From Date</Text>
              <TouchableOpacity
                style={[styles.dateInput, { 
                  backgroundColor: isDark ? '#374151' : '#fff', 
                  borderColor: isDark ? '#4b5563' : '#d1d5db' 
                }]}
                onPress={() => setShowFromDatePicker(true)}
              >
                <Text style={[styles.dateText, { color: isDark ? '#f3f4f6' : '#374151' }]}>
                  {filters.from_date || 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={isDark ? '#9ca3af' : '#666'} />
              </TouchableOpacity>
              {showFromDatePicker && (
                <DateTimePicker
                  value={filters.from_date ? new Date(filters.from_date) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onFromDateChange}
                />
              )}
            </View>

            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>To Date</Text>
              <TouchableOpacity
                style={[styles.dateInput, { 
                  backgroundColor: isDark ? '#374151' : '#fff', 
                  borderColor: isDark ? '#4b5563' : '#d1d5db' 
                }]}
                onPress={() => setShowToDatePicker(true)}
              >
                <Text style={[styles.dateText, { color: isDark ? '#f3f4f6' : '#374151' }]}>
                  {filters.to_date || 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={isDark ? '#9ca3af' : '#666'} />
              </TouchableOpacity>
              {showToDatePicker && (
                <DateTimePicker
                  value={filters.to_date ? new Date(filters.to_date) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onToDateChange}
                />
              )}
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Booking ID</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#374151' : '#fff', 
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                  color: isDark ? '#f3f4f6' : '#374151'
                }]}
                value={filters.booking_id_or_pnr}
                onChangeText={(text) => setFilters({ ...filters, booking_id_or_pnr: text })}
                placeholder="Search..."
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Agent SL / Name</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#374151' : '#fff', 
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                  color: isDark ? '#f3f4f6' : '#374151'
                }]}
                value={filters.agent_sl_or_name}
                onChangeText={(text) => setFilters({ ...filters, agent_sl_or_name: text })}
                placeholder="Search..."
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              />
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Platform Type</Text>
              <View style={[styles.pickerContainer, { 
                backgroundColor: isDark ? '#374151' : '#fff', 
                borderColor: isDark ? '#4b5563' : '#d1d5db'
              }]}>
                <Picker
                  selectedValue={filters.platform_type || ''}
                  onValueChange={(value) => setFilters({ ...filters, platform_type: value })}
                  style={[styles.picker, { color: isDark ? '#f3f4f6' : '#374151' }]}
                  mode="dropdown"
                  dropdownIconColor={isDark ? '#9ca3af' : '#666'}
                >
                  <Picker.Item label="All Platforms" value="" />
                  <Picker.Item label="B2B" value="B2B" />
                  <Picker.Item label="B2C" value="B2C" />
                </Picker>
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Status</Text>
              <View style={[styles.pickerContainer, { 
                backgroundColor: isDark ? '#374151' : '#fff', 
                borderColor: isDark ? '#4b5563' : '#d1d5db'
              }]}>
                <Picker
                  selectedValue={filters.status || ''}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                  style={[styles.picker, { color: isDark ? '#f3f4f6' : '#374151' }]}
                  mode="dropdown"
                  dropdownIconColor={isDark ? '#9ca3af' : '#666'}
                >
                  <Picker.Item label="All Statuses" value="" />
                  <Picker.Item label="CONFIRMED" value="CONFIRMED" />
                  <Picker.Item label="CANCELLED" value="CANCELLED" />
                  <Picker.Item label="FAILED" value="FAILED" />
                  <Picker.Item label="VOID" value="VOID" />
                  <Picker.Item label="PENDING" value="PENDING" />
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.resetButton, { backgroundColor: isDark ? '#6b7280' : '#f3f4f6', borderColor: isDark ? '#4b5563' : '#d1d5db' }]} 
              onPress={handleReset}
            >
              <Text style={[styles.buttonText, { color: isDark ? '#f3f4f6' : '#374151' }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.searchButton, { backgroundColor: isDark ? '#3b82f6' : '#1e40af' }]} 
              onPress={handleSearch}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Data Count Display */}
      {!loading && (
        <View style={[styles.dataCountContainer, { 
          backgroundColor: isDark ? '#1f2937' : '#fff', 
          borderBottomColor: isDark ? '#374151' : '#e5e7eb' 
        }]}>
          <View style={styles.dataCountContent}>
            <Text style={[styles.dataCountText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              Showing {bookings.length} of {pagination.total} hotels
            </Text>
            {pagination.total > 0 && (
              <Text style={[styles.dataCountDetails, { color: isDark ? '#6b7280' : '#9ca3af' }]}>
                Page {pagination.currentPage} of {pagination.lastPage}
              </Text>
            )}
          </View>
          {pagination.total > 0 && (
            <View style={[styles.dataCountBadge, { backgroundColor: isDark ? '#3b82f6' : '#1e40af' }]}>
              <Text style={styles.dataCountBadgeText}>{pagination.total}</Text>
            </View>
          )}
        </View>
      )}

      {loading ? (
        <SkeletonList itemCount={8} />
      ) : (
        <>
          <FlatList
            data={bookings}
            renderItem={renderBookingItem}
            keyExtractor={(item, index) => `booking-${item.id}-${index}`}
            contentContainerStyle={styles.listContainer}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            showsVerticalScrollIndicator={true}
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>No hotel bookings found</Text>
              </View>
            }
            ListFooterComponent={() => 
              isLoadingMore ? (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color={isDark ? '#3b82f6' : '#1e40af'} />
                  <Text style={[styles.loadMoreText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Loading more...</Text>
                </View>
              ) : null
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButton: {
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
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  dateInput: {
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
  },
  pickerContainer: {
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 50,
  },
  picker: {
    height: 50,
    backgroundColor: 'transparent',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  searchButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  resetButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  profit: {
  },
  bookingIdBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookingIdText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  platformBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  platformText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  brandBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  brandText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
  },
  dataCountContainer: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  dataCountContent: {
    flex: 1,
  },
  dataCountText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  dataCountDetails: {
    fontSize: 12,
  },
  dataCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  dataCountBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});