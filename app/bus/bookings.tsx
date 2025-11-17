import { bookingStatusService } from '@/services/booking-status';
import { busService } from '@/services/bus';
import { BookingStatusMap, BusBooking, BusBookingFilters } from '@/types/bus';
import { getTodayLocalDate } from '@/utils/date';
import { useThemeColors } from '@/hooks/use-theme-colors';
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
  const colors = useThemeColors();
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
    return {
      from_date: '', // Allow user to select any date
      to_date: '',   // Allow user to select any date
      booking_id_or_pnr: '',
      agent_sl_or_name: '',
      ticket_number: '',
      status: '',
      page: 1,
      per_page: 15,
    };
  });

  useEffect(() => {
    loadBookingStatuses();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [filters.page]);

  const loadBookingStatuses = async () => {
    try {
      const statusData = await bookingStatusService.getBookingStatuses();
      setStatuses(statusData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load booking statuses');
    }
  };

  const loadBookings = async (isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await busService.getBookings(filters);
      
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
    setFilters({ ...filters, page: 1 });
    loadBookings();
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && pagination.currentPage < pagination.lastPage) {
      const nextPage = pagination.currentPage + 1;
      setFilters({ ...filters, page: nextPage });
      loadBookings(true); // Load more data
    }
  };

  const handleReset = () => {
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
    setFilters(resetFilters);
    setBookings([]); // Clear existing bookings
    // Trigger search with reset filters
    setTimeout(() => loadBookings(), 100);
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
      style={styles.bookingCard}
      onPress={() => router.push(`/bus/booking-details?id=${item.unique_trans_id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Text style={styles.label}>Booking Date:</Text>
        <Text style={styles.value}>{formatDate(item.created_at)}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Booking Id:</Text>
        <View style={styles.bookingIdBadge}>
          <Text style={styles.bookingIdText}>{item.unique_trans_id}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Agent:</Text>
        <Text style={styles.value}>{item.agent_name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Booking Ref No:</Text>
        <Text style={styles.value}>{item.booking_ref_number}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Brand:</Text>
        <View style={[styles.brandBadge, getBrandColor(item.api_name)]}>
          <Text style={styles.brandText}>{item.api_name}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Ticket Number:</Text>
        <Text style={styles.value}>{item.ticket_numbers}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Cost:</Text>
        <Text style={styles.value}>{item.currency} {item.costing}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Payment:</Text>
        <Text style={styles.value}>{item.currency} {item.total_price_selling}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Profit:</Text>
        <Text style={[styles.value, styles.profit]}>
          {item.currency} {calculateProfit(item.total_price_selling, item.costing)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
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
      backgroundColor: colors.background,
    },
    safeArea: {
      backgroundColor: colors.headerBackground,
    },
    header: {
      backgroundColor: colors.headerBackground,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.headerText,
    },
    headerButton: {
      width: 24,
    },
    filterToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    filterToggleText: {
      color: colors.headerText,
      fontSize: 14,
      fontWeight: '600',
    },
    filterContainer: {
      backgroundColor: colors.filterBackground,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      color: colors.text,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 6,
      padding: 10,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      color: colors.inputText,
    },
    dateInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: 6,
      padding: 10,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateText: {
      fontSize: 14,
      color: colors.inputText,
    },
    pickerContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      overflow: 'hidden',
    },
    picker: {
      height: 40,
      color: colors.inputText,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    searchButton: {
      flex: 1,
      backgroundColor: colors.buttonPrimary,
      padding: 12,
      borderRadius: 6,
      alignItems: 'center',
    },
    resetButton: {
      flex: 1,
      backgroundColor: colors.buttonSecondary,
      padding: 12,
      borderRadius: 6,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.buttonText,
      fontSize: 14,
      fontWeight: '600',
    },
    paginationInfo: {
      backgroundColor: colors.card,
      padding: 12,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    paginationText: {
      fontSize: 14,
      color: colors.text,
    },
    listContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    bookingCard: {
      backgroundColor: colors.card,
      margin: 8,
      marginBottom: 0,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
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
      color: colors.text,
      opacity: 0.7,
      fontWeight: '500',
    },
    value: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
      textAlign: 'right',
      flex: 1,
    },
    pnrValue: {
      fontSize: 14,
      color: colors.buttonPrimary,
      fontWeight: '600',
      textAlign: 'right',
      flex: 1,
      textDecorationLine: 'underline',
    },
    profit: {
      fontSize: 14,
      fontWeight: '600',
    },
    bookingIdBadge: {
      backgroundColor: colors.buttonPrimary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    bookingIdText: {
      color: colors.buttonText,
      fontSize: 10,
      fontWeight: '600',
    },
    brandBadge: {
      backgroundColor: colors.buttonSecondary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    brandText: {
      color: colors.buttonText,
      fontSize: 10,
      fontWeight: '600',
    },
    loadingMore: {
      padding: 20,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 8,
      color: colors.text,
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
      color: colors.text,
      textAlign: 'center',
      marginTop: 16,
    },
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
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
        <View style={styles.filterContainer}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
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
                />
              </View>

              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Agent</Text>
                <TextInput
                  style={styles.input}
                  value={filters.agent_sl_or_name}
                  onChangeText={(text) => setFilters({ ...filters, agent_sl_or_name: text })}
                  placeholder="Search..."
                />
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Ticket Number</Text>
                <TextInput
                  style={styles.input}
                  value={filters.ticket_number}
                  onChangeText={(text) => setFilters({ ...filters, ticket_number: text })}
                  placeholder="Search..."
                />
              </View>

              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Status</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={filters.status || ''}
                    onValueChange={(value: string) => setFilters({ ...filters, status: value })}
                    style={styles.picker}
                    mode="dropdown"
                    dropdownIconColor="#666"
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
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
                <Text style={styles.emptyText}>No bookings found</Text>
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
      backgroundColor: colors.background,
    },
    safeArea: {
      backgroundColor: colors.headerBackground,
    },
    header: {
      backgroundColor: colors.headerBackground,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.headerText,
    },
    filterToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    filterToggleText: {
      color: colors.headerText,
      fontSize: 14,
      fontWeight: '600',
    },
    filterContainer: {
      backgroundColor: colors.filterBackground,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      color: colors.text,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 6,
      padding: 10,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      color: colors.inputText,
    },
    dateInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: 6,
      padding: 10,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateText: {
      fontSize: 14,
      color: colors.inputText,
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
  listContainer: {
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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
  headerButton: {
    padding: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
