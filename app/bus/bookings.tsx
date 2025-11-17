import { useTheme } from '@/hooks/use-theme';
import { bookingStatusService } from '@/services/booking-status';
import { busService } from '@/services/bus';
import { BookingStatusMap, BusBooking, BusBookingFilters } from '@/types/bus';
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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BusBookingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [bookings, setBookings] = useState<BusBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [statuses, setStatuses] = useState<BookingStatusMap>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
  });

  // Filter states
  const [filters, setFilters] = useState<BusBookingFilters>(() => {
    // Get today's date in local timezone
    const today = new Date();
    const localDate = today.toISOString().split('T')[0];
    
    return {
      from_date: localDate, // Default to today's date
      to_date: localDate,   // Default to today's date
      booking_id_or_pnr: '',
      agent_sl_or_name: '',
      ticket_number: '',
      status: '',
      page: 1,
      per_page: 15,
    };
  });

  useEffect(() => {
    console.log('🚀 Component mounted - loading initial data');
    loadBookingStatuses();
    // Load bookings with initial filters (today's date)
    loadBookings();
  }, []);

  // Remove this useEffect to prevent interference with infinite scroll
  // useEffect(() => {
  //   if (filters.page > 1) {
  //     loadBookings();
  //   }
  // }, [filters.page]);

  const loadBookingStatuses = async () => {
    try {
      const statusData = await bookingStatusService.getBookingStatuses();
      setStatuses(statusData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load booking statuses');
    }
  };

  const loadBookings = async (isLoadMore = false, customFilters?: BusBookingFilters) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    const filtersToUse = customFilters || filters;
    
    try {
      console.log('🚌 Bus booking request - isLoadMore:', isLoadMore, 'customFilters:', !!customFilters);
      console.log('Final bus booking request filters:', filtersToUse);
      const response = await busService.getBookings(filtersToUse);
      
      if (isLoadMore) {
        // Append new data to existing bookings, avoiding duplicates
        setBookings(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newBookings = response.data.filter(item => !existingIds.has(item.id));
          return [...prev, ...newBookings];
        });
      } else {
        // Replace with new data (for search/filter)
        setBookings(response.data);
      }
      
      setPagination({
        total: response.total,
        currentPage: response.current_page,
        lastPage: response.last_page,
        perPage: response.per_page,
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSearch = () => {
    console.log('🔍 Search clicked');
    const searchFilters = { ...filters, page: 1 };
    setFilters(searchFilters);
    // Reset bookings and pagination for new search
    setBookings([]);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadBookings(false, searchFilters);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && pagination.currentPage < pagination.lastPage) {
      const nextPage = pagination.currentPage + 1;
      // Don't update filters state, just pass the next page directly
      const loadMoreFilters = { ...filters, page: nextPage };
      loadBookings(true, loadMoreFilters); // Load more data with next page
    }
  };

  const handleReset = () => {
    console.log('🔄 Reset clicked');
    const resetFilters = {
      from_date: '', // Clear dates so user can select any date range
      to_date: '',   // Clear dates so user can select any date range
      booking_id_or_pnr: '',
      agent_sl_or_name: '',
      ticket_number: '',
      status: '',
      page: 1,
      per_page: 15,
    };
    console.log('Reset filters:', resetFilters);
    setFilters(resetFilters);
    setBookings([]); // Clear existing bookings
    // Reset pagination as well
    setPagination({
      total: 0,
      currentPage: 1,
      lastPage: 1,
      perPage: 15,
    });
    // Automatically search with empty filters to show all data
    setTimeout(() => {
      loadBookings(false, resetFilters);
    }, 100);
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

  const calculateProfit = (selling: string, costing: string): string => {
    const profit = parseFloat(selling) - parseFloat(costing);
    return profit.toFixed(2);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderBookingItem = ({ item }: { item: BusBooking }) => (
    <TouchableOpacity
      style={[styles.bookingCard, { 
        backgroundColor: isDark ? '#1f2937' : '#fff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        shadowColor: isDark ? '#000' : '#000'
      }]}
      onPress={() => router.push(`/bus/booking-details?id=${item.unique_trans_id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Booking Date:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{formatDate(item.created_at)}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Booking Id:</Text>
        <View style={[styles.bookingIdBadge, { 
          backgroundColor: isDark ? '#3b82f6' : '#1e40af'
        }]}>
          <Text style={[styles.bookingIdText, { color: '#fff' }]}>{item.unique_trans_id}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Agent:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{item.agent_name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Booking Ref No:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{item.booking_ref_number}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Brand:</Text>
        <View style={[styles.brandBadge, getBrandColor(item.api_name)]}>
          <Text style={styles.brandText}>{item.api_name}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Ticket Number:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{item.ticket_numbers}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Cost:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{item.currency} {item.costing}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Payment:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{item.currency} {item.total_price_selling}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Profit:</Text>
        <Text style={[styles.value, styles.profit, { color: isDark ? '#10b981' : '#059669' }]}>
          {item.currency} {calculateProfit(item.total_price_selling, item.costing)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Status:</Text>
        <View style={[styles.statusBadge, getStatusColor(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { backgroundColor: '#10b981' };
      case 'CANCELED':
      case 'VOID':
        return { backgroundColor: '#ef4444' };
      case 'FAILED':
      case 'REJECT':
        return { backgroundColor: '#f59e0b' };
      default:
        return { backgroundColor: '#6b7280' };
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'RB':
        return { backgroundColor: '#8b5cf6' }; // Purple
      case 'TB':
        return { backgroundColor: '#f59e0b' }; // Orange
      case 'TS':
        return { backgroundColor: '#06b6d4' }; // Cyan
      default:
        return { backgroundColor: '#3b82f6' }; // Blue
    }
  };

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
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
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
    paginationInfo: {
      padding: 12,
      alignItems: 'center',
      borderBottomWidth: 1,
    },
    paginationText: {
      fontSize: 14,
    },
    listContainer: {
      paddingVertical: 4,
      flexGrow: 1,
    },
    bookingCard: {
      margin: 8,
      marginBottom: 8,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    label: {
      fontSize: 12,
      opacity: 0.7,
      fontWeight: '500',
    },
    value: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'right',
      flex: 1,
    },
    pnrValue: {
      fontSize: 14,
      color: '#1e40af',
      fontWeight: '600',
      textAlign: 'right',
      flex: 1,
      textDecorationLine: 'underline',
    },
    profit: {
      fontSize: 14,
      fontWeight: '600',
      color: '#10b981',
    },
    bookingIdBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    bookingIdText: {
      fontSize: 10,
      fontWeight: '600',
    },
    brandBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    brandText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '600',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    statusText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingMore: {
      padding: 20,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 8,
      fontSize: 14,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: 16,
    },
    flatList: {
      flex: 1,
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

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bus Bookings</Text>
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
        <View style={[styles.filterContainer, { backgroundColor: isDark ? '#1f2937' : '#f8f9fa', borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
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
                <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Booking ID / PNR</Text>
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
                <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Agent</Text>
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
                <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Ticket Number</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? '#374151' : '#fff', 
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    color: isDark ? '#f3f4f6' : '#374151'
                  }]}
                  value={filters.ticket_number}
                  onChangeText={(text) => setFilters({ ...filters, ticket_number: text })}
                  placeholder="Search..."
                  placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                />
              </View>

              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Status</Text>
                <View style={[styles.pickerContainer, { 
                  backgroundColor: isDark ? '#374151' : '#fff', 
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}>
                  <Picker
                    selectedValue={filters.status || ''}
                    onValueChange={(value: string) => setFilters({ ...filters, status: value })}
                    style={[styles.picker, { color: isDark ? '#f3f4f6' : '#374151' }]}
                    mode="dropdown"
                    dropdownIconColor={isDark ? '#9ca3af' : '#666'}
                  >
                    <Picker.Item label="All Statuses" value="" />
                    {Object.entries(statuses).map(([key, value]) => (
                      <Picker.Item key={key} label={value} value={value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.searchButton, { backgroundColor: isDark ? '#3b82f6' : '#1e40af' }]} 
                onPress={handleSearch}
              >
                <Text style={[styles.buttonText, { color: '#fff' }]}>Search</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.resetButton, { backgroundColor: isDark ? '#6b7280' : '#f3f4f6', borderColor: isDark ? '#4b5563' : '#d1d5db' }]} 
                onPress={handleReset}
              >
                <Text style={[styles.buttonText, { color: isDark ? '#f3f4f6' : '#374151' }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
              Showing {bookings.length} of {pagination.total} bookings
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#3b82f6' : '#1e40af'} />
        </View>
      ) : (
        <>
          <FlatList
            data={bookings}
            renderItem={renderBookingItem}
            keyExtractor={(item, index) => `booking-${item.id}-${index}`}
            style={styles.flatList}
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
                <Text style={[styles.emptyText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>No bookings found</Text>
              </View>
            }
            ListFooterComponent={() => 
              isLoadingMore ? (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={isDark ? '#3b82f6' : '#1e40af'} />
                  <Text style={[styles.loadingText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Loading more...</Text>
                </View>
              ) : null
            }
          />
        </>
      )}
    </View>
  );
}
