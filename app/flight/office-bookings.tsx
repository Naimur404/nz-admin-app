import { bookingStatusService } from '@/services/booking-status';
import { flightService } from '@/services/flight';
import { FlightBooking, FlightBookingFilters } from '@/types/flight';
import { getTodayLocalDate } from '@/utils/date';
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

export default function OfficeFlightBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<FlightBooking[]>([]);
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
  const [filters, setFilters] = useState<FlightBookingFilters>(() => {
    const today = getTodayLocalDate();
    return {
      agent_sl_or_name: '',
      airline_name: '',
      api_id: '',
      booking_id_or_pnr: '',
      from_date: today, // Local timezone today's date
      market_id: null,
      page: 1,
      per_page: 10,
      staff: '',
      status: '',
      ticket_no: '',
      to_date: today,   // Local timezone today's date
    };
  });

  useEffect(() => {
    loadBookingStatuses();
    loadBookings(); // Load all bookings initially
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

  // Helper function to load bookings with specific filters
  const loadBookingsWithFilters = async (filterParams: FlightBookingFilters, isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const requestParams = {
        ...filterParams,
        page: isLoadMore ? pagination.currentPage + 1 : 1,
      };
      
      const response = await flightService.getBookings('office', requestParams);
      
      if (isLoadMore) {
        // Append new data to existing bookings, avoiding duplicates
        setBookings(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newBookings = response.data.filter((item: FlightBooking) => !existingIds.has(item.id));
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
      loadBookingsWithFilters(filters, true); // Load more data
    }
  };

  const handleReset = () => {
    const today = getTodayLocalDate();
    const resetFilters = {
      agent_sl_or_name: '',
      airline_name: '',
      api_id: '',
      booking_id_or_pnr: '',
      from_date: today, // Local timezone today's date
      market_id: null,
      page: 1,
      per_page: 10,
      staff: '',
      status: '',
      ticket_no: '',
      to_date: today,   // Local timezone today's date
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
    
    // Load bookings with the reset filters directly
    setTimeout(() => {
      loadBookingsWithFilters(resetFilters);
    }, 100);
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

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
      case 'BOOKED':
        return { backgroundColor: '#10b981' };
      case 'CANCELED':
      case 'CANCELLED':
        return { backgroundColor: '#ef4444' };
      case 'PROCESS':
      case 'TICKET IN PROCESS':
        return { backgroundColor: '#f59e0b' };
      case 'PENDING':
        return { backgroundColor: '#6b7280' };
      default:
        return { backgroundColor: '#6b7280' };
    }
  };

  const getJourneyTypeColor = (journeyType: string) => {
    switch (journeyType) {
      case 'OW':
        return { backgroundColor: '#3b82f6' };
      case 'RT':
        return { backgroundColor: '#8b5cf6' };
      default:
        return { backgroundColor: '#6b7280' };
    }
  };

  const onFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFilters({ ...filters, from_date: formattedDate });
    }
  };

  const onToDateChange = (event: any, selectedDate?: Date) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFilters({ ...filters, to_date: formattedDate });
    }
  };

  const renderBookingItem = ({ item }: { item: FlightBooking }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => router.push(`/flight/booking-details?id=${item.booking_trans_id}`)}
    >
      <View style={styles.row}>
        <Text style={styles.label}>Booking Date:</Text>
        <Text style={styles.value}>{formatDate(item.booking_date)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Agent Name:</Text>
        <Text style={styles.value} numberOfLines={2}>
          {item.agent_name}({item.agent_sl_no})
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Booking ID:</Text>
        <View style={styles.bookingIdBadge}>
          <Text style={styles.bookingIdText}>{item.booking_trans_id}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Airline:</Text>
        <Text style={styles.value}>{item.airline_name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Routes:</Text>
        <Text style={styles.value}>{item.routes}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>PNR:</Text>
        <Text style={styles.value}>{item.pnr || 'N/A'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Cost:</Text>
        <Text style={[styles.value, styles.profit]}>
          {item.currency} {parseFloat(item.total_price_selling).toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Profit:</Text>
        <Text style={[styles.value, parseFloat(item.profit) >= 0 ? styles.profit : styles.loss]}>
          {item.currency} {parseFloat(item.profit).toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Payment:</Text>
        <Text style={styles.value}>{item.payment_method}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Journey Type:</Text>
        <View style={[styles.journeyBadge, getJourneyTypeColor(item.journey_type.value)]}>
          <Text style={styles.journeyText}>{item.journey_type.value}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <View style={[styles.statusBadge, getStatusColor(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Ticket Number:</Text>
        <Text style={styles.value}>{item.ticket_number}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Office Flight Bookings</Text>
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterToggleText}>Filters</Text>
            <Ionicons
              name={showFilters ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {showFilters && (
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>From Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowFromDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {filters.from_date || 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
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
              <Text style={styles.filterLabel}>To Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowToDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {filters.to_date || 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
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
              <Text style={styles.filterLabel}>Booking ID/PNR</Text>
              <TextInput
                style={styles.input}
                value={filters.booking_id_or_pnr}
                onChangeText={(text) => setFilters({ ...filters, booking_id_or_pnr: text })}
                placeholder="Search..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Agent SL / Name</Text>
              <TextInput
                style={styles.input}
                value={filters.agent_sl_or_name}
                onChangeText={(text) => setFilters({ ...filters, agent_sl_or_name: text })}
                placeholder="Search..."
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Airline Name</Text>
              <TextInput
                style={styles.input}
                value={filters.airline_name}
                onChangeText={(text) => setFilters({ ...filters, airline_name: text })}
                placeholder="Search..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Ticket No</Text>
              <TextInput
                style={styles.input}
                value={filters.ticket_no}
                onChangeText={(text) => setFilters({ ...filters, ticket_no: text })}
                placeholder="Search..."
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Staff</Text>
              <TextInput
                style={styles.input}
                value={filters.staff}
                onChangeText={(text) => setFilters({ ...filters, staff: text })}
                placeholder="Search..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.status || ''}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                  style={styles.picker}
                  mode="dropdown"
                  dropdownIconColor="#666"
                >
                  <Picker.Item label="All Statuses" value="" />
                  {statusOptions.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      ) : (
        <>
          <FlatList
            data={bookings}
            renderItem={renderBookingItem}
            keyExtractor={(item, index) => `booking-${item.id}-${index}`}
            contentContainerStyle={styles.listContainer}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No flight bookings found</Text>
              </View>
            }
            ListFooterComponent={() => 
              isLoadingMore ? (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color="#1e40af" />
                  <Text style={styles.loadMoreText}>Loading more...</Text>
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
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    backgroundColor: '#1e40af',
  },
  header: {
    backgroundColor: '#1e40af',
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
    padding: 4,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterToggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    backgroundColor: '#1e40af',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
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
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  profit: {
    color: '#10b981',
  },
  loss: {
    color: '#ef4444',
  },
  bookingIdBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookingIdText: {
    color: '#fff',
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
  journeyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  journeyText: {
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
    color: '#666',
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
    color: '#666',
  },
});