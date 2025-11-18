import { useTheme } from '@/hooks/use-theme';
import { DepositItem, depositsService } from '@/services/deposits';
import { marketService } from '@/services/market';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Linking,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DepositFilters {
  from_date: string;
  to_date: string;
  agent_id: string;
  status: string;
  market_id: string;
  bank_name: string;
  agent_type: number;
}

export default function OfficeDepositsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State management
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [markets, setMarkets] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
  });

  // Summary state
  const [summary, setSummary] = useState({
    totalAmount: 0,
    currency: 'MYR',
    count: 0
  });

  // Modal state for attachment viewing
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState<{
    url: string;
    type: 'image' | 'pdf';
  } | null>(null);

  // Filter states - Fixed for Office (agent_type: 1)
  const [filters, setFilters] = useState<DepositFilters>(() => {
    // Start with today's date like bus bookings for initial load
    const today = new Date();
    const localDate = today.toISOString().split('T')[0];
    
    return {
      from_date: localDate, // Default to today's date for initial load
      to_date: localDate,   // Default to today's date for initial load
      agent_id: '',
      status: '',
      market_id: '',
      bank_name: '',
      agent_type: 1 // Always 1 for Office
    };
  });

  // Load data
  useEffect(() => {
    loadDeposits();
    loadMarkets();
  }, []);

  const loadDeposits = async (customFilters?: any) => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Use custom filters if provided, otherwise use current filters
      const currentFilters = customFilters || filters;
      const params = {
        ...currentFilters,
        page: pagination.currentPage,
        per_page: pagination.perPage
      };
      
      const response = await depositsService.getOfficeDeposits(params);
      
      setDeposits(response.data || []);
      
      // Update pagination
      setPagination({
        total: response.dataCount || 0,
        currentPage: response.current_page || 1,
        lastPage: response.last_page || 1,
        perPage: pagination.perPage,
      });
      
      // Calculate summary
      const totalAmount = response.data?.reduce((sum, item) => {
        return sum + parseFloat(item.amount || '0');
      }, 0) || 0;
      
      setSummary({
        totalAmount,
        currency: response.data?.[0]?.currency || 'MYR',
        count: response.data?.length || 0
      });
      
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load office deposits data');
    } finally {
      setLoading(false);
    }
  };

  const loadMarkets = async () => {
    try {
      const response = await marketService.getMarketList();
      setMarkets(response || []);
    } catch (error) {
      // Market loading failed silently
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDeposits().finally(() => setRefreshing(false));
  };

  const handleSearch = () => {
    // Reset to first page for new search
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadDeposits();
  };

  const handleReset = () => {
    const resetFilters = {
      from_date: '', // Clear dates so user can select any date range
      to_date: '',   // Clear dates so user can select any date range
      agent_id: '',
      status: '',
      market_id: '',
      bank_name: '',
      agent_type: 1 // Always 1 for Office
    };
    
    setFilters(resetFilters);
    setDeposits([]); // Clear existing deposits
    
    // Reset pagination
    setPagination({
      total: 0,
      currentPage: 1,
      lastPage: 1,
      perPage: 15,
    });
    
    // Close any open date pickers
    setShowFromDatePicker(false);
    setShowToDatePicker(false);
    
    // Automatically search with empty filters
    setTimeout(() => {
      loadDeposits(resetFilters);
    }, 100);
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined, type: 'from' | 'to') => {
    // Always close the pickers first
    setShowFromDatePicker(false);
    setShowToDatePicker(false);

    if (selectedDate && event.type !== 'dismissed') {
      const localDate = selectedDate.toISOString().split('T')[0];
      setFilters(prev => ({
        ...prev,
        [type === 'from' ? 'from_date' : 'to_date']: localDate
      }));
    }
  };

  // Helper functions
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

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const formatDisplayDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const getAttachmentType = (url: string): 'image' | 'pdf' => {
    const lowercaseUrl = url.toLowerCase();
    if (lowercaseUrl.includes('.jpg') || lowercaseUrl.includes('.jpeg') || 
        lowercaseUrl.includes('.png') || lowercaseUrl.includes('.gif') || 
        lowercaseUrl.includes('.bmp') || lowercaseUrl.includes('.webp')) {
      return 'image';
    }
    return 'pdf'; // Default to PDF for other file types
  };

  const handleViewAttachment = async (attachmentUrl: string) => {
    try {
      const attachmentType = getAttachmentType(attachmentUrl);
      setCurrentAttachment({
        url: attachmentUrl,
        type: attachmentType
      });
      setShowAttachmentModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to open attachment');
    }
  };

  const closeAttachmentModal = () => {
    setShowAttachmentModal(false);
    setCurrentAttachment(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
      <StatusBar barStyle="light-content" backgroundColor={isDark ? '#1f2937' : '#1e40af'} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Office Deposits</Text>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <View style={styles.filterToggle}>
              <Ionicons name="filter" size={20} color="#fff" />
              <Text style={styles.filterToggleText}>Filter</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Filters */}
      {showFilters && (
        <View style={[styles.filterContainer, { backgroundColor: isDark ? '#1f2937' : '#f8f9fa', borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>From Date</Text>
                <Pressable
                  style={[styles.dateInput, { 
                    backgroundColor: isDark ? '#374151' : '#fff',
                    borderColor: isDark ? '#4b5563' : '#d1d5db'
                  }]}
                  onPress={() => setShowFromDatePicker(true)}
                >
                  <Text style={[styles.dateText, { color: filters.from_date ? (isDark ? '#f3f4f6' : '#111827') : (isDark ? '#9ca3af' : '#6b7280') }]}>
                    {filters.from_date || 'Select From Date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                </Pressable>
              </View>

              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>To Date</Text>
                <Pressable
                  style={[styles.dateInput, { 
                    backgroundColor: isDark ? '#374151' : '#fff',
                    borderColor: isDark ? '#4b5563' : '#d1d5db'
                  }]}
                  onPress={() => setShowToDatePicker(true)}
                >
                  <Text style={[styles.dateText, { color: filters.to_date ? (isDark ? '#f3f4f6' : '#111827') : (isDark ? '#9ca3af' : '#6b7280') }]}>
                    {filters.to_date || 'Select To Date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                </Pressable>
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Agent ID</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? '#374151' : '#fff',
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    color: isDark ? '#f3f4f6' : '#111827'
                  }]}
                  value={filters.agent_id}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, agent_id: text }))}
                  placeholder="Enter agent ID"
                  placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                />
              </View>

              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Bank Name</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? '#374151' : '#fff',
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    color: isDark ? '#f3f4f6' : '#111827'
                  }]}
                  value={filters.bank_name}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, bank_name: text }))}
                  placeholder="Enter bank name"
                  placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                />
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Market</Text>
                <View style={[styles.pickerContainer, { 
                  backgroundColor: isDark ? '#374151' : '#fff',
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                }]}>
                  <Picker
                    selectedValue={filters.market_id}
                    style={[styles.picker, { color: isDark ? '#f3f4f6' : '#111827' }]}
                    onValueChange={(itemValue) => setFilters(prev => ({ ...prev, market_id: itemValue }))}
                    dropdownIconColor={isDark ? '#f3f4f6' : '#111827'}
                  >
                    <Picker.Item label="All Markets" value="" />
                    {markets.map((market) => (
                      <Picker.Item key={market.id} label={market.market_name} value={market.id.toString()} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Status</Text>
                <View style={[styles.pickerContainer, { 
                  backgroundColor: isDark ? '#374151' : '#fff',
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                }]}>
                  <Picker
                    selectedValue={filters.status}
                    style={[styles.picker, { color: isDark ? '#f3f4f6' : '#111827' }]}
                    onValueChange={(itemValue) => setFilters(prev => ({ ...prev, status: itemValue }))}
                    dropdownIconColor={isDark ? '#f3f4f6' : '#111827'}
                  >
                    <Picker.Item label="All Status" value="" />
                    <Picker.Item label="Pending" value="0" />
                    <Picker.Item label="Approved" value="1" />
                    <Picker.Item label="Rejected" value="-1" />
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
                style={[styles.resetButton, { 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }]}
                onPress={handleReset}
              >
                <Text style={[styles.buttonText, { color: isDark ? '#f3f4f6' : '#374151' }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Pagination Info */}
      <View style={[styles.paginationInfo, { 
        backgroundColor: isDark ? '#1f2937' : '#fff', 
        borderBottomColor: isDark ? '#374151' : '#e5e7eb' 
      }]}>
        <View style={styles.dataCountContent}>
          <Text style={[styles.dataCountText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Showing {deposits.length} of {pagination.total} deposits
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

      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: isDark ? '#1f2937' : '#fff', borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]}>
        <View style={styles.summaryContent}>
          <View style={styles.summaryInfo}>
            <Text style={[styles.summaryTitle, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
              Topup Request - {summary.count}
            </Text>
            <Text style={[styles.summaryAmount, { color: isDark ? '#10b981' : '#059669' }]}>
              Total Amount: {summary.currency} {summary.totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#3b82f6' : '#1e40af'} />
          <Text style={[styles.loadingText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Loading office deposits...
          </Text>
        </View>
      ) : deposits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color={isDark ? '#4b5563' : '#d1d5db'} />
          <Text style={[styles.emptyTitle, { color: isDark ? '#f3f4f6' : '#4b5563' }]}>No Office Deposits</Text>
          <Text style={[styles.emptySubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            No office deposits found for the selected criteria.
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.flatList}
          contentContainerStyle={styles.listContainer}
          data={deposits}
          renderItem={renderDepositItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1e40af']}
              tintColor={isDark ? '#3b82f6' : '#1e40af'}
            />
          }
        />
      )}

      {/* Date Pickers */}
      {showFromDatePicker && (
        <DateTimePicker
          value={filters.from_date ? new Date(filters.from_date + 'T00:00:00') : new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, 'from')}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={filters.to_date ? new Date(filters.to_date + 'T00:00:00') : new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, 'to')}
        />
      )}

      {/* Attachment Modal */}
      <Modal
        visible={showAttachmentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeAttachmentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>
                Attachment Preview
              </Text>
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
                onPress={closeAttachmentModal}
              >
                <Ionicons name="close" size={24} color={isDark ? '#f3f4f6' : '#111827'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {currentAttachment?.type === 'image' ? (
                <ScrollView
                  maximumZoomScale={3.0}
                  minimumZoomScale={1.0}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                >
                  <Image
                    source={{ uri: currentAttachment.url }}
                    style={styles.attachmentImage}
                    resizeMode="contain"
                  />
                </ScrollView>
              ) : (
                <View style={styles.pdfContainer}>
                  <Ionicons name="document-text" size={64} color={isDark ? '#9ca3af' : '#6b7280'} />
                  <Text style={[styles.pdfText, { color: isDark ? '#f3f4f6' : '#111827' }]}>
                    PDF Document
                  </Text>
                  <Text style={[styles.pdfSubtext, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                    Tap "Open Externally" to view in a PDF reader
                  </Text>
                  <TouchableOpacity
                    style={[styles.openExternallyButton, { backgroundColor: isDark ? '#3b82f6' : '#1e40af' }]}
                    onPress={() => {
                      if (currentAttachment?.url) {
                        Linking.openURL(currentAttachment.url);
                      }
                    }}
                  >
                    <Text style={styles.openExternallyButtonText}>Open Externally</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  function renderDepositItem({ item }: { item: DepositItem }) {
    return (
      <View style={[styles.depositCard, { 
        backgroundColor: isDark ? '#1f2937' : '#fff',
        borderColor: isDark ? '#374151' : '#e5e7eb',
      }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Date:</Text>
          <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>
            {formatDisplayDate(item.issue_date)}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Ref ID:</Text>
          <View style={[styles.refIdBadge, { backgroundColor: isDark ? '#3b82f6' : '#1e40af' }]}>
            <Text style={[styles.refIdText, { color: '#fff' }]}>{item.reference_id}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Agent:</Text>
          <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>
            {item.agent_name}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Agent SL:</Text>
          <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>
            {item.agent_sl_no || 'N/A'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Contact:</Text>
          <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>
            {item.agent_mobile_no}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Partner:</Text>
          <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>
            {item.partner_name}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Type:</Text>
          <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>
            {item.payment_method}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Amount:</Text>
          <Text style={[styles.value, styles.amount, { color: isDark ? '#10b981' : '#059669' }]}>
            {item.currency} {parseFloat(item.amount).toFixed(2)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Approved By:</Text>
          <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>
            {item.approve_by}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Note:</Text>
          <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>
            {item.remarks || 'N/A'}
          </Text>
        </View>

        {item.attachment && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Attachment:</Text>
            <TouchableOpacity 
              style={[styles.viewButton, { backgroundColor: isDark ? '#3b82f6' : '#1e40af' }]}
              onPress={() => item.attachment && handleViewAttachment(item.attachment)}
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    // Background color handled dynamically inline
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Background color handled dynamically inline
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
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
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  paginationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dataCountContent: {
    flex: 1,
  },
  dataCountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dataCountDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  dataCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  dataCountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 4,
    flexGrow: 1,
  },
  depositCard: {
    margin: 8,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
  subValue: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
    fontWeight: '500',
  },
  refIdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  refIdText: {
    fontSize: 12,
    fontWeight: '600',
  },
  agentInfo: {
    flex: 2,
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
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
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    height: '50%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor moved to inline style for theme support
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  attachmentImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
  },
  pdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  pdfSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  openExternallyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  openExternallyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});