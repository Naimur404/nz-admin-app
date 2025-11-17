import { useTheme } from '@/hooks/use-theme';
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
import { SkeletonList } from '@/components/ui/skeleton';

import { apiListService } from '@/services/api-list';
import { bookingStatusService } from '@/services/booking-status';
import { marketService } from '@/services/market';
import { staffService } from '@/services/staff';
import { ticketSupportService } from '@/services/ticket-support';
import { OptionItem } from '@/types/common';
import { DataCountResponse, TicketSupport, TicketSupportFilters } from '@/types/ticket-support';

export default function TicketSupportScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [ticketSupports, setTicketSupports] = useState<TicketSupport[]>([]);
  const [dataCount, setDataCount] = useState<DataCountResponse | null>(null);
  const [ticketStats, setTicketStats] = useState({
    dataCount: 0,
    total_pax: 0, 
    total_segment: 0,
    total_reissue_pax: 0
  });
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
    return {
      agent_sl_or_name: '',
      airline_name: '',
      api_id: '',
      booking_id_or_pnr: '',
      from_date: '', // Allow user to select any date
      market_id: '',
      page: 1,
      per_page: 20,
      platform_type: '',
      staff: null,
      status: '',
      ticket_no: '',
      to_date: '',   // Allow user to select any date
    };
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  // Remove the forced date setting useEffect to allow user-selected dates

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTicketSupports(),
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

      // Set ticket stats from the main response
      const newTicketStats = {
        dataCount: response.dataCount || 0,
        total_pax: response.total_pax || 0,
        total_segment: response.total_segment || 0,
        total_reissue_pax: response.total_reissue_pax || 0
      };
      
      console.log('Setting ticket stats:', newTicketStats);
      console.log('API response dataCount:', response.dataCount);
      setTicketStats(newTicketStats);
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
      const loadMoreFilters = { ...filters, page: nextPage };
      setFilters(loadMoreFilters);
      loadTicketSupports(true);
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

  const handleReset = async () => {
    // Clear all filters including dates
    const resetFilters: TicketSupportFilters = {
      agent_sl_or_name: '',
      airline_name: '',
      api_id: '',
      booking_id_or_pnr: '',
      from_date: '', // Clear dates so user can select any date range
      market_id: '',
      page: 1,
      per_page: 20,
      platform_type: '',
      staff: null,
      status: '',
      ticket_no: '',
      to_date: '',   // Clear dates so user can select any date range
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
    if (!supportType) return { backgroundColor: '#6b7280' };
    
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
      style={[styles.ticketCard, { 
        backgroundColor: isDark ? '#1f2937' : '#fff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        shadowColor: isDark ? '#000' : '#000'
      }]}
      onPress={() => router.push(`/flight/booking-details?id=${item.booking_trans_id}`)}
    >
      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Booking Date:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{formatDate(item.booking_date)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Confirm Time:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{formatDateTime(item.confirm_date || 'N/A')}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Agent Name:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]} numberOfLines={2}>
          {item.agent_name}({item.agent_sl_no})
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Phone:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{item.agent_number}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Airline:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{item.airline_name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Brand:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{item.brand}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Booking ID | PNR:</Text>
        <View style={[styles.bookingIdBadge, getBookingIdColor(item.booking_trans_id)]}>
          <Text style={styles.bookingIdText}>{item.booking_trans_id} | {item.pnr || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Booking Ref:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{item.booking_ref_number || 'N/A'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Market:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{item.market_name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Payment:</Text>
        <View style={[styles.paymentBadge, getPaymentStatusColor(item.payment_status)]}>
          <Text style={styles.paymentText}>{item.payment_status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Status:</Text>
        <View style={[styles.statusBadge, getStatusColor(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Is Refund:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }, item.is_refund ? styles.refund : styles.noRefund]}>
          {item.is_refund ? 'Yes' : 'No'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Status Staff/ES:</Text>
        <View style={[styles.supportTypeBadge, getSupportTypeColor(item.support_type || '')]}>
          <Text style={styles.supportTypeText}>{item.support_type || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>On Pro/Time:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{item.on_process} / {formatDateTime(item.on_process_time || 'N/A')}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Platform Type:</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{item.platform_type}</Text>
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

      {/* Data Count Display */}
      {!loading && !showFilters && (
        <View style={[styles.dataCountContainer, { 
          backgroundColor: isDark ? '#1f2937' : '#fff', 
          borderBottomColor: isDark ? '#374151' : '#e5e7eb' 
        }]}>
          <View style={styles.dataCountContent}>
            <Text style={[styles.dataCountText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              Showing {ticketSupports.length} of {pagination.total} tickets
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

      {/* Summary Text */}
      {ticketStats.dataCount > 0 && !showFilters && (
        <View style={[styles.summaryTextContainer, { 
          backgroundColor: isDark ? '#1f2937' : '#fff',
          borderColor: isDark ? '#374151' : '#e5e7eb'
        }]}>
          <Text style={[styles.summaryText, { color: isDark ? '#60a5fa' : '#1e40af' }]}>
            Booking {ticketStats.dataCount}, Pax: {ticketStats.total_pax}, Segment: {ticketStats.total_segment}, Reissue Pax: {ticketStats.total_reissue_pax}
          </Text>
        </View>
      )}

      {showFilters && (
        <View style={[styles.filterContainer, { 
          backgroundColor: isDark ? '#1f2937' : '#fff',
          borderBottomColor: isDark ? '#374151' : '#e5e7eb'
        }]}>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#333' }]}>Agent/Name</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb',
                  color: isDark ? '#f3f4f6' : '#333'
                }]}
                value={filters.agent_sl_or_name}
                onChangeText={(text) => setFilters({ ...filters, agent_sl_or_name: text })}
                placeholder="Search..."
                placeholderTextColor={isDark ? '#9ca3af' : '#999'}
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#333' }]}>Airline</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb',
                  color: isDark ? '#f3f4f6' : '#333'
                }]}
                value={filters.airline_name}
                onChangeText={(text) => setFilters({ ...filters, airline_name: text })}
                placeholder="Search..."
                placeholderTextColor={isDark ? '#9ca3af' : '#999'}
              />
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#333' }]}>Booking ID/PNR</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb',
                  color: isDark ? '#f3f4f6' : '#333'
                }]}
                value={filters.booking_id_or_pnr}
                onChangeText={(text) => setFilters({ ...filters, booking_id_or_pnr: text })}
                placeholder="Search..."
                placeholderTextColor={isDark ? '#9ca3af' : '#999'}
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#333' }]}>Ticket No</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb',
                  color: isDark ? '#f3f4f6' : '#333'
                }]}
                value={filters.ticket_no}
                onChangeText={(text) => setFilters({ ...filters, ticket_no: text })}
                placeholder="Search..."
                placeholderTextColor={isDark ? '#9ca3af' : '#999'}
              />
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#333' }]}>From Date</Text>
              <TouchableOpacity
                style={[styles.dateInput, { 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb'
                }]}
                onPress={() => setShowFromDate(true)}
              >
                <Text style={[styles.dateText, { color: isDark ? '#f3f4f6' : '#333' }]}>
                  {filters.from_date || 'Select from date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={isDark ? '#9ca3af' : '#666'} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#333' }]}>To Date</Text>
              <TouchableOpacity
                style={[styles.dateInput, { 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb'
                }]}
                onPress={() => setShowToDate(true)}
              >
                <Text style={[styles.dateText, { color: isDark ? '#f3f4f6' : '#333' }]}>
                  {filters.to_date || 'Select to date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={isDark ? '#9ca3af' : '#666'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#333' }]}>Status</Text>
              <View style={[styles.pickerContainer, { 
                backgroundColor: isDark ? '#374151' : '#f3f4f6',
                borderColor: isDark ? '#4b5563' : '#e5e7eb'
              }]}>
                <Picker
                  selectedValue={filters.status}
                  onValueChange={(itemValue) => setFilters({ ...filters, status: itemValue })}
                  style={[styles.picker, { color: isDark ? '#f3f4f6' : '#333' }]}
                  mode="dropdown"
                  dropdownIconColor={isDark ? '#9ca3af' : '#666'}
                >
                  <Picker.Item label="All Status" value="" />
                  {statusOptions.map((status) => (
                    <Picker.Item key={status.value} label={status.label} value={status.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#333' }]}>Platform</Text>
              <View style={[styles.pickerContainer, { 
                backgroundColor: isDark ? '#374151' : '#f3f4f6',
                borderColor: isDark ? '#4b5563' : '#e5e7eb'
              }]}>
                <Picker
                  selectedValue={filters.platform_type}
                  onValueChange={(itemValue) => setFilters({ ...filters, platform_type: itemValue })}
                  style={[styles.picker, { color: isDark ? '#f3f4f6' : '#333' }]}
                  mode="dropdown"
                  dropdownIconColor={isDark ? '#9ca3af' : '#666'}
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
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#333' }]}>API</Text>
              <View style={[styles.pickerContainer, { 
                backgroundColor: isDark ? '#374151' : '#f3f4f6',
                borderColor: isDark ? '#4b5563' : '#e5e7eb'
              }]}>
                <Picker
                  selectedValue={filters.api_id}
                  onValueChange={(itemValue) => setFilters({ ...filters, api_id: itemValue })}
                  style={[styles.picker, { color: isDark ? '#f3f4f6' : '#333' }]}
                  mode="dropdown"
                  dropdownIconColor={isDark ? '#9ca3af' : '#666'}
                >
                  <Picker.Item label="All APIs" value="" />
                  {apiOptions.map((api) => (
                    <Picker.Item key={api.value} label={api.label} value={api.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#333' }]}>Market</Text>
              <View style={[styles.pickerContainer, { 
                backgroundColor: isDark ? '#374151' : '#f3f4f6',
                borderColor: isDark ? '#4b5563' : '#e5e7eb'
              }]}>
                <Picker
                  selectedValue={filters.market_id}
                  onValueChange={(itemValue) => setFilters({ ...filters, market_id: itemValue })}
                  style={[styles.picker, { color: isDark ? '#f3f4f6' : '#333' }]}
                  mode="dropdown"
                  dropdownIconColor={isDark ? '#9ca3af' : '#666'}
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
              <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#333' }]}>Staff</Text>
              <View style={styles.staffContainer}>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? '#374151' : '#f3f4f6',
                    borderColor: isDark ? '#4b5563' : '#e5e7eb',
                    color: isDark ? '#f3f4f6' : '#333'
                  }]}
                  value={staffSearchText}
                  onChangeText={handleStaffSearch}
                  onFocus={handleStaffInputFocus}
                  placeholder="Search staff by name or email..."
                  placeholderTextColor={isDark ? '#9ca3af' : '#999'}
                />
                {showStaffDropdown && filteredStaffOptions.length > 0 && (
                  <ScrollView style={[styles.staffDropdown, { 
                    backgroundColor: isDark ? '#374151' : '#fff',
                    borderColor: isDark ? '#4b5563' : '#e5e7eb'
                  }]} nestedScrollEnabled>
                    {filteredStaffOptions.map((staff) => (
                      <TouchableOpacity
                        key={staff.value}
                        style={[styles.staffOption, { borderBottomColor: isDark ? '#4b5563' : '#f3f4f6' }]}
                        onPress={() => handleStaffSelect(staff)}
                      >
                        <Text style={[styles.staffOptionText, { color: isDark ? '#f3f4f6' : '#333' }]}>{staff.label}</Text>
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
            <TouchableOpacity style={[styles.resetButton, { backgroundColor: isDark ? '#6b7280' : '#6b7280' }]} onPress={handleReset}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.searchButton, { backgroundColor: isDark ? '#3b82f6' : '#1e40af' }]} onPress={handleSearch}>
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <SkeletonList itemCount={8} />
      ) : (
        <FlatList
          data={ticketSupports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTicketSupportItem}
          contentContainerStyle={styles.listContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          showsVerticalScrollIndicator={true}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          ListFooterComponent={() => 
            isLoadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={isDark ? '#3b82f6' : '#1e40af'} />
                <Text style={[styles.loadMoreText, { color: isDark ? '#9ca3af' : '#666' }]}>Loading more...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={() => 
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: isDark ? '#9ca3af' : '#666' }]}>No ticket support data found</Text>
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
  },
  safeArea: {
  },
  header: {
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
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
  staffContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  staffDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    borderWidth: 1,
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
  },
  staffOptionText: {
    fontSize: 14,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
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