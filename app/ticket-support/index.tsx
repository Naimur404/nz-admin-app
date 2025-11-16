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
import { apiListService } from '@/services/api-list';
import { marketService } from '@/services/market';
import { staffService } from '@/services/staff';
import { DataCountResponse, TicketSupport, TicketSupportFilters } from '@/types/ticket-support';
import { OptionItem } from '@/types/common';

export default function TicketSupportScreen() {
  const router = useRouter();
  const [ticketSupports, setTicketSupports] = useState<TicketSupport[]>([]);
  const [dataCount, setDataCount] = useState<DataCountResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [statusOptions, setStatusOptions] = useState<Array<{label: string, value: string}>>([]);
  const [apiOptions, setApiOptions] = useState<OptionItem[]>([]);
  const [marketOptions, setMarketOptions] = useState<OptionItem[]>([]);
  const [staffOptions, setStaffOptions] = useState<OptionItem[]>([]);
  const [filteredStaffOptions, setFilteredStaffOptions] = useState<OptionItem[]>([]);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [staffSearchText, setStaffSearchText] = useState('');
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
        loadStatusOptions(),
        loadApiOptions(),
        loadMarketOptions(),
        loadStaffOptions()
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

  const loadApiOptions = async () => {
    try {
      const options = await apiListService.getApiOptions();
      setApiOptions(options);
    } catch (error) {
      console.error('Error loading API options:', error);
    }
  };

  const loadMarketOptions = async () => {
    try {
      const options = await marketService.getMarketOptions();
      setMarketOptions(options);
    } catch (error) {
      console.error('Error loading market options:', error);
    }
  };

  const loadStaffOptions = async () => {
    try {
      const options = await staffService.getStaffOptions();
      setStaffOptions(options);
      setFilteredStaffOptions(options);
    } catch (error) {
      console.error('Error loading staff options:', error);
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

  const handleStaffSearch = (text: string) => {
    setStaffSearchText(text);
    if (text.trim() === '') {
      setFilteredStaffOptions(staffOptions);
    } else {
      const filtered = staffOptions.filter(staff =>
        staff.label.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredStaffOptions(filtered);
    }
  };

  const handleStaffSelect = (staff: OptionItem) => {
    setFilters({ ...filters, staff: staff.value.toString() });
    setStaffSearchText(staff.label);
    setShowStaffDropdown(false);
  };

  const handleStaffInputFocus = () => {
    setShowStaffDropdown(true);
    if (staffSearchText === '') {
      setFilteredStaffOptions(staffOptions);
    }
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
    setStaffSearchText('');
    setFilteredStaffOptions(staffOptions);
    setShowStaffDropdown(false);
    
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

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
      case 'SUCCESS':
        return { backgroundColor: '#10b981' };
      case 'PENDING':
        return { backgroundColor: '#f59e0b' };
      case 'FAILED':
      case 'CANCELLED':
        return { backgroundColor: '#ef4444' };
      case 'PARTIAL':
        return { backgroundColor: '#8b5cf6' };
      default:
        return { backgroundColor: '#6b7280' };
    }
  };

  const getBookingIdColor = (bookingId: string) => {
    // Generate consistent color based on booking ID
    const colors = [
      '#3b82f6', // Blue
      '#10b981', // Green
      '#f59e0b', // Orange
      '#8b5cf6', // Purple
      '#ef4444', // Red
      '#06b6d4', // Cyan
    ];
    
    const hash = bookingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return { backgroundColor: colors[hash % colors.length] };
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
        <View style={[styles.bookingIdBadge, getBookingIdColor(item.booking_trans_id)]}>
          <Text style={styles.bookingIdText}>{item.booking_trans_id} | {item.pnr || 'N/A'}</Text>
        </View>
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
        <View style={[styles.paymentBadge, getPaymentStatusColor(item.payment_status)]}>
          <Text style={styles.paymentText}>{item.payment_status}</Text>
        </View>
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

      {/* Summary Text */}
      {dataCount && (
        <View style={styles.summaryTextContainer}>
          <Text style={styles.summaryText}>
            Booking {pagination.total}, Pax: {dataCount.total_pax || 0}, Segment: {dataCount.total_segment || 0}, Reissue Pax: {dataCount.total_reissue_pax || 0}
          </Text>
        </View>
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

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>API</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.api_id}
                  onValueChange={(itemValue) => setFilters({ ...filters, api_id: itemValue })}
                  style={styles.picker}
                  mode="dropdown"
                  dropdownIconColor="#666"
                >
                  <Picker.Item label="All APIs" value="" />
                  {apiOptions.map((api) => (
                    <Picker.Item key={api.value} label={api.label} value={api.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Market</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.market_id}
                  onValueChange={(itemValue) => setFilters({ ...filters, market_id: itemValue })}
                  style={styles.picker}
                  mode="dropdown"
                  dropdownIconColor="#666"
                >
                  <Picker.Item label="All Markets" value="" />
                  {marketOptions.map((market) => (
                    <Picker.Item key={market.value} label={market.label} value={market.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Staff</Text>
              <View style={styles.staffContainer}>
                <TextInput
                  style={styles.input}
                  value={staffSearchText}
                  onChangeText={handleStaffSearch}
                  onFocus={handleStaffInputFocus}
                  placeholder="Search staff by name or email..."
                  placeholderTextColor="#999"
                />
                {showStaffDropdown && filteredStaffOptions.length > 0 && (
                  <ScrollView style={styles.staffDropdown} nestedScrollEnabled>
                    {filteredStaffOptions.map((staff) => (
                      <TouchableOpacity
                        key={staff.value}
                        style={styles.staffOption}
                        onPress={() => handleStaffSelect(staff)}
                      >
                        <Text style={styles.staffOptionText}>{staff.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                {showStaffDropdown && (
                  <TouchableOpacity
                    style={styles.dropdownOverlay}
                    onPress={() => setShowStaffDropdown(false)}
                  />
                )}
              </View>
            </View>

            <View style={styles.filterItem}>
              {/* Empty space for alignment */}
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
  summaryTextContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
    textAlign: 'center',
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
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  ticketCard: {
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
  bookingIdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookingIdText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentText: {
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
  staffContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  staffDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    maxHeight: 200,
    zIndex: 1001,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  staffOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  staffOptionText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});