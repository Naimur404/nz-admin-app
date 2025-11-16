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

import { bookingStatusService } from '@/services/booking-status';
import { ticketSupportService } from '@/services/ticket-support';
import { DataCountResponse, TicketSupport, TicketSupportFilters } from '@/types/ticket-support';

export default function TicketSupportScreen() {
  const router = useRouter();
  const [ticketSupports, setTicketSupports] = useState<TicketSupport[]>([]);
  const [dataCount, setDataCount] = useState<DataCountResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [statusOptions, setStatusOptions] = useState<Array<{label: string, value: string}>>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
  });

  const [filters, setFilters] = useState<TicketSupportFilters>(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      agent_sl_or_name: '',
      airline_name: '',
      api_id: '',
      booking_id_or_pnr: '',
      from_date: today,
      market_id: '',
      page: 1,
      per_page: 20,
      platform_type: '',
      staff: null,
      status: '',
      ticket_no: '',
      to_date: today,
    };
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTicketSupports(),
        loadDataCount(),
        loadStatusOptions()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketSupports = async (isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await ticketSupportService.getTicketSupport(filters);
      
      if (isLoadMore) {
        // Append new data to existing supports, avoiding duplicates
        setTicketSupports(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newSupports = response.data?.filter(item => !existingIds.has(item.id)) || [];
          return [...prev, ...newSupports];
        });
      } else {
        // Replace with new data (for search/filter)
        setTicketSupports(response.data || []);
      }

      setPagination({
        total: response.dataCount || 0,
        currentPage: response.current_page || 1,
        lastPage: response.last_page || 1,
        perPage: 20,
      });
    } catch (error) {
      console.error('Error loading ticket supports:', error);
      Alert.alert('Error', 'Failed to load ticket support data');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadDataCount = async () => {
    try {
      const response = await ticketSupportService.getDataCount();
      setDataCount(response);
    } catch (error) {
      console.error('Error loading data count:', error);
    }
  };

  const loadStatusOptions = async () => {
    try {
      const statusMap = await bookingStatusService.getBookingStatuses();
      const statusArray = Object.keys(statusMap).map(key => ({
        label: statusMap[key],
        value: statusMap[key]
      }));
      setStatusOptions(statusArray);
    } catch (error) {
      console.error('Error loading status options:', error);
    }
  };

  const loadTicketSupportsWithFilters = (newFilters: TicketSupportFilters) => {
    setFilters(newFilters);
    loadTicketSupports();
  };

  const handleDateChange = (event: any, selectedDate?: Date, type?: 'from' | 'to') => {
    if (Platform.OS === 'android') {
      setShowFromDate(false);
      setShowToDate(false);
    }

    if (selectedDate && type) {
      const dateString = selectedDate.toISOString().split('T')[0];
      const newFilters = {
        ...filters,
        [type === 'from' ? 'from_date' : 'to_date']: dateString,
        page: 1,
      };
      setTicketSupports([]);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      setFilters(newFilters);
      loadTicketSupports();
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && pagination.currentPage < pagination.lastPage) {
      const nextPage = pagination.currentPage + 1;
      setFilters({ ...filters, page: nextPage });
      loadTicketSupports(true); // Load more data
    }
  };

  const handleSearch = () => {
    const newFilters = { ...filters, page: 1 };
    setTicketSupports([]);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setFilters(newFilters);
    loadTicketSupports();
  };

  const handleReset = () => {
    const today = new Date().toISOString().split('T')[0];
    const resetFilters: TicketSupportFilters = {
      agent_sl_or_name: '',
      airline_name: '',
      api_id: '',
      booking_id_or_pnr: '',
      from_date: today,
      market_id: '',
      page: 1,
      per_page: 20,
      platform_type: '',
      staff: null,
      status: '',
      ticket_no: '',
      to_date: today,
    };
    
    setTicketSupports([]);
    setPagination({
      total: 0,
      currentPage: 1,
      lastPage: 1,
      perPage: 20,
    });
    
    setFilters(resetFilters);
    
    setTimeout(() => {
      loadTicketSupports();
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
      case 'TICKET IN PROCESS':
        return { backgroundColor: '#f59e0b' };
      case 'PROCESS':
        return { backgroundColor: '#6b7280' };
      default:
        return { backgroundColor: '#6b7280' };
    }
  };

  const getSupportTypeColor = (supportType: string) => {
    switch (supportType.toLowerCase()) {
      case 'approved':
        return { backgroundColor: '#10b981' };
      case 'on call':
        return { backgroundColor: '#f59e0b' };
      case 'pending':
        return { backgroundColor: '#6b7280' };
      case 'cancel':
        return { backgroundColor: '#ef4444' };
      default:
        return { backgroundColor: '#6b7280' };
    }
  };

  const renderTicketSupportItem = ({ item }: { item: TicketSupport }) => (
    <TouchableOpacity 
      style={styles.ticketCard}
      onPress={() => router.push(`/flight/booking-details?id=${item.booking_trans_id}`)}
    >
      <View style={styles.row}>
        <Text style={styles.label}>Booking Date:</Text>
        <Text style={styles.value}>{formatDate(item.booking_date)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Confirm Time:</Text>
        <Text style={styles.value}>{formatDateTime(item.confirm_date || 'N/A')}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Agent Name:</Text>
        <Text style={styles.value} numberOfLines={2}>
          {item.agent_name}({item.agent_sl_no})
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{item.agent_number}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Airline:</Text>
        <Text style={styles.value}>{item.airline_name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Brand:</Text>
        <Text style={styles.value}>{item.brand}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Booking ID | PNR:</Text>
        <Text style={styles.value}>{item.booking_trans_id} | {item.pnr || 'N/A'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Booking Ref:</Text>
        <Text style={styles.value}>{item.booking_ref_number || 'N/A'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Market:</Text>
        <Text style={styles.value}>{item.market_name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Payment:</Text>
        <Text style={styles.value}>{item.payment_status}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <View style={[styles.statusBadge, getStatusColor(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Is Refund:</Text>
        <Text style={[styles.value, item.is_refund ? styles.refund : styles.noRefund]}>
          {item.is_refund ? 'Yes' : 'No'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Status Staff/ES:</Text>
        <View style={[styles.supportTypeBadge, getSupportTypeColor(item.support_type)]}>
          <Text style={styles.supportTypeText}>{item.support_type}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>On Pro/Time:</Text>
        <Text style={styles.value}>{item.on_process} / {formatDateTime(item.on_process_time || 'N/A')}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Platform Type:</Text>
        <Text style={styles.value}>{item.platform_type}</Text>
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
          <Text style={styles.headerTitle}>Air Ticket Support</Text>
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

      {/* Summary Statistics */}
      {dataCount && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.summaryContainer}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Pax</Text>
            <Text style={styles.summaryValue}>{dataCount.total_pax || 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Segment</Text>
            <Text style={styles.summaryValue}>{dataCount.total_segment || 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Reissue Pax</Text>
            <Text style={styles.summaryValue}>{dataCount.total_reissue_pax || 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Flight Info</Text>
            <Text style={styles.summaryValue}>{dataCount.flight_info}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Cancel Request</Text>
            <Text style={styles.summaryValue}>{dataCount.cancel_request}</Text>
          </View>
        </ScrollView>
      )}

      {showFilters && (
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Agent/Name</Text>
              <TextInput
                style={styles.input}
                value={filters.agent_sl_or_name}
                onChangeText={(text) => setFilters({ ...filters, agent_sl_or_name: text })}
                placeholder="Search..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Airline</Text>
              <TextInput
                style={styles.input}
                value={filters.airline_name}
                onChangeText={(text) => setFilters({ ...filters, airline_name: text })}
                placeholder="Search..."
                placeholderTextColor="#999"
              />
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
              <Text style={styles.filterLabel}>From Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowFromDate(true)}
              >
                <Text style={styles.dateText}>
                  {filters.from_date || 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>To Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowToDate(true)}
              >
                <Text style={styles.dateText}>
                  {filters.to_date || 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.status}
                  onValueChange={(itemValue) => setFilters({ ...filters, status: itemValue })}
                  style={styles.picker}
                  mode="dropdown"
                  dropdownIconColor="#666"
                >
                  <Picker.Item label="All Status" value="" />
                  {statusOptions.map((status) => (
                    <Picker.Item key={status.value} label={status.label} value={status.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Platform</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.platform_type}
                  onValueChange={(itemValue) => setFilters({ ...filters, platform_type: itemValue })}
                  style={styles.picker}
                  mode="dropdown"
                  dropdownIconColor="#666"
                >
                  <Picker.Item label="All Platforms" value="" />
                  <Picker.Item label="B2B" value="B2B" />
                  <Picker.Item label="B2C" value="B2C" />
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

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      ) : (
        <FlatList
          data={ticketSupports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTicketSupportItem}
          contentContainerStyle={styles.listContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => 
            isLoadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#1e40af" />
                <Text style={styles.loadMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={() => 
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No ticket support data found</Text>
              </View>
            ) : null
          }
        />
      )}

      {showFromDate && (
        <DateTimePicker
          value={new Date(filters.from_date)}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'from')}
        />
      )}

      {showToDate && (
        <DateTimePicker
          value={new Date(filters.to_date)}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'to')}
        />
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
  headerButton: {
    padding: 4,
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
  summaryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 85,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
    textAlign: 'center',
    lineHeight: 12,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
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
  ticketCard: {
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
  supportTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  supportTypeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  refund: {
    color: '#ef4444',
  },
  noRefund: {
    color: '#10b981',
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