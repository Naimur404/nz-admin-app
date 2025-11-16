import { attractionService } from '@/services/attraction';
import { bookingStatusService } from '@/services/booking-status';
import { AttractionBooking } from '@/types/attraction';
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

interface AttractionFilters {
  from_date: string;
  to_date: string;
  booking_id_or_pnr: string;
  agent_sl_or_name: string;
  status: string;
  page: number;
  per_page: number;
}

export default function AttractionBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<AttractionBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [statusOptions, setStatusOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
  });

  // Filter states
  const [filters, setFilters] = useState<AttractionFilters>({
    from_date: '',
    to_date: '',
    booking_id_or_pnr: '',
    agent_sl_or_name: '',
    status: '',
    page: 1,
    per_page: 15,
  });

  useEffect(() => {
    loadBookingStatuses();
    loadBookings(); // Load all bookings initially
  }, []);

  useEffect(() => {
    if (filters.page > 1) { // Only load on page changes, not initial load
      loadBookings();
    }
  }, [filters.page]);

  const loadBookingStatuses = async () => {
    try {
      const statusData = await bookingStatusService.getBookingStatuses();
      const options = bookingStatusService.getStatusOptions(statusData);
      setStatusOptions(options);
    } catch (error) {
      Alert.alert('Error', 'Failed to load booking statuses');
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await attractionService.getBookings(filters);
      setBookings(response.data);
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
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    loadBookings();
  };

  const handleReset = () => {
    const resetFilters = {
      from_date: '',
      to_date: '',
      booking_id_or_pnr: '',
      agent_sl_or_name: '',
      status: '',
      page: 1,
      per_page: 15,
    };
    setFilters(resetFilters);
    setTimeout(() => {
      loadBookings();
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

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'CANCELED':
      case 'CANCELLED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Attraction':
        return '#8b5cf6';
      case 'Tours':
        return '#06b6d4';
      case 'F&B':
        return '#f97316';
      default:
        return '#3b82f6';
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

  const renderBookingItem = ({ item }: { item: AttractionBooking }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => router.push(`/attractions/booking-details?bookingTransId=${item.booking_trans_id}`)}
    >
      <View style={styles.row}>
        <Text style={styles.label}>Booking ID:</Text>
        <View style={styles.bookingIdBadge}>
          <Text style={styles.bookingIdText}>{item.booking_trans_id}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>PNR:</Text>
        <Text style={styles.pnrValue}>{item.pnr}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Product:</Text>
        <Text style={styles.value}>{item.product_name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Package:</Text>
        <Text style={styles.value}>{item.package_name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Category:</Text>
        <View style={[styles.brandBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.brandText}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <View style={[styles.brandBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.brandText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Visit Date:</Text>
        <Text style={styles.value}>{formatDate(item.visited_date)}</Text>
      </View>

      {item.time_slot && (
        <View style={styles.row}>
          <Text style={styles.label}>Time Slot:</Text>
          <Text style={styles.value}>{item.time_slot}</Text>
        </View>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Passengers:</Text>
        <Text style={styles.value}>{item.total_passengers}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Agent:</Text>
        <Text style={styles.value}>{item.agent_info.agent_name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Amount:</Text>
        <Text style={[styles.value, styles.profit]}>
          {item.currency} {parseFloat(item.total_price_selling).toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Booking Date:</Text>
        <Text style={styles.value}>{formatDate(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Attraction Bookings</Text>
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
              <Text style={styles.filterLabel}>Booking ID / PNR</Text>
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
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.status || ''}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="All Statuses" value="" />
                  {statusOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
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
          {pagination.total > 0 && (
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of{' '}
                {pagination.total} results
              </Text>
              <Text style={styles.paginationText}>
                Page {pagination.currentPage} of {pagination.lastPage}
              </Text>
            </View>
          )}

          <FlatList
            data={bookings}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.booking_id.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No bookings found</Text>
              </View>
            }
          />

          {pagination.total > 0 && (
            <View style={styles.paginationButtons}>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  pagination.currentPage === 1 && styles.pageButtonDisabled,
                ]}
                onPress={() => setFilters({ ...filters, page: pagination.currentPage - 1 })}
                disabled={pagination.currentPage === 1}
              >
                <Text style={styles.pageButtonText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  pagination.currentPage === pagination.lastPage && styles.pageButtonDisabled,
                ]}
                onPress={() => setFilters({ ...filters, page: pagination.currentPage + 1 })}
                disabled={pagination.currentPage === pagination.lastPage}
              >
                <Text style={styles.pageButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
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
  },
  picker: {
    height: 40,
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
  paginationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  paginationText: {
    fontSize: 12,
    color: '#666',
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
    flex: 1,
    textAlign: 'right',
  },
  pnrValue: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
    lineHeight: 14,
  },
  profit: {
    color: '#10b981',
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
    color: '#666',
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  pageButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  pageButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  pageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
