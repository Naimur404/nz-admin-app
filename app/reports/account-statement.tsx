import { Skeleton, SkeletonList } from '@/components/ui/skeleton';
import { marketService } from '@/services/market';
import { OptionItem } from '@/types/common';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/use-theme';
import { reportsService } from '../../services/reports';
import { AccountStatementFilters, AccountStatementItem } from '../../types/account-statement';

export default function AccountStatementScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const [statements, setStatements] = useState<AccountStatementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [dataCount, setDataCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [marketOptions, setMarketOptions] = useState<OptionItem[]>([]);
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);

  const [filters, setFilters] = useState<AccountStatementFilters>({
    agent: '',
    api_provider: 0,
    from_date: '',
    market_id: null,
    page: 1,
    per_page: 10,
    ticket_number_pnr: '',
    to_date: '',
  });

  const loadStatements = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await reportsService.getAccountStatement({
        ...filters,
        page,
        per_page: 10,
      });

      if (response.flag) {
        const newStatements = response.data;
        
        if (isRefresh || page === 1) {
          setStatements(newStatements);
        } else {
          setStatements(prev => [...prev, ...newStatements]);
        }

        setCurrentPage(response.current_page);
        setLastPage(response.last_page);
        setDataCount(response.dataCount);
      }
    } catch (error) {
      console.error('Error loading account statements:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStatements();
    loadMarketOptions();
  }, []);

  const loadMarketOptions = async () => {
    try {
      const options = await marketService.getMarketOptions();
      setMarketOptions(options);
    } catch (error) {
      console.error('Error loading market options:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadStatements(1, true);
  };

  const loadMoreData = () => {
    if (!loadingMore && currentPage < lastPage) {
      loadStatements(currentPage + 1);
    }
  };

  const resetFilters = () => {
    const defaultFilters: AccountStatementFilters = {
      agent: '',
      api_provider: 0,
      from_date: '',
      market_id: null,
      page: 1,
      per_page: 10,
      ticket_number_pnr: '',
      to_date: '',
    };
    setFilters(defaultFilters);
    setCurrentPage(1);
    loadStatements(1, true);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    loadStatements(1, true);
  };

  const handleDateChange = (event: any, selectedDate?: Date, type?: 'from' | 'to') => {
    if (Platform.OS === 'android') {
      setShowFromDate(false);
      setShowToDate(false);
    }

    if (selectedDate && type) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFilters(prev => ({
        ...prev,
        [type === 'from' ? 'from_date' : 'to_date']: dateString,
      }));
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  const getTransactionTypeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'credit':
        return '#10b981'; // Green
      case 'debit':
        return '#ef4444'; // Red
      default:
        return isDark ? '#9ca3af' : '#6b7280';
    }
  };

  const renderStatementItem = ({ item }: { item: AccountStatementItem }) => (
    <View style={[styles.itemContainer, { backgroundColor: isDark ? '#1f2937' : '#ffffff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
      {/* Date & Time */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Date & Time</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
          {formatDateTime(item.trx_date)}
        </Text>
      </View>

      {/* Agent Name & ID */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Agent</Text>
        <View style={styles.agentContainer}>
          <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
            {item.agent_name}
          </Text>
          <Text style={[styles.subValue, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            ID: {item.agent_sl_no}
          </Text>
        </View>
      </View>

      {/* Transaction Type & Code */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Transaction</Text>
        <View style={styles.transactionContainer}>
          <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
            {item.trx_type.name}
          </Text>
          <Text style={[
            styles.transactionCode, 
            { 
              color: getTransactionTypeColor(item.trx_type.action),
              backgroundColor: `${getTransactionTypeColor(item.trx_type.action)}20`
            }
          ]}>
            {item.trx_type.code}
          </Text>
        </View>
      </View>

      {/* Unique Transaction ID */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Uniq Trx ID</Text>
        <Text style={[styles.value, styles.monoFont, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
          {item.uniq_trx_no}
        </Text>
      </View>

      {/* Reference Information */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Reference</Text>
        <View>
          <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
            Ref No: {item.ref_no || 'N/A'}
          </Text>
          <Text style={[styles.subValue, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Ref ID: {item.trx_ref_id || 'N/A'}
          </Text>
        </View>
      </View>

      {/* PNR */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>PNR</Text>
        <Text style={[styles.value, styles.monoFont, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
          {item.pnr}
        </Text>
      </View>

      {/* Notes */}
      {item.remarks && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Notes</Text>
          <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
            {item.remarks}
          </Text>
        </View>
      )}

      {/* Financial Information */}
      <View style={styles.financialContainer}>
        <View style={styles.financialRow}>
          <View style={styles.financialItem}>
            <Text style={[styles.financialLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Debit</Text>
            <Text style={[styles.financialValue, { color: '#ef4444' }]}>
              {parseFloat(item.debit) > 0 ? `${item.currency} ${parseFloat(item.debit).toFixed(2)}` : '-'}
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={[styles.financialLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Credit</Text>
            <Text style={[styles.financialValue, { color: '#10b981' }]}>
              {parseFloat(item.credit) > 0 ? `${item.currency} ${parseFloat(item.credit).toFixed(2)}` : '-'}
            </Text>
          </View>
        </View>
        <View style={styles.financialRow}>
          <View style={styles.financialItem}>
            <Text style={[styles.financialLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Balance</Text>
            <Text style={[styles.financialValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
              {item.currency} {parseFloat(item.balance).toFixed(2)}
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={[styles.financialLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Loan Balance</Text>
            <Text style={[styles.financialValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
              {item.currency} {parseFloat(item.loan_balance).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Approved By */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Approved By</Text>
        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
          {item.approve_by}
        </Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Agent Account Statement</Text>
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
  );

  const renderDataCount = () => (
    <View style={[styles.dataCountContainer, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }]}>
      {loading && refreshing ? (
        <Skeleton width={200} height={20} />
      ) : (
        <Text style={[styles.dataCountText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          Showing {statements.length} of {dataCount.toLocaleString()} statements
        </Text>
      )}
    </View>
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

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
        No Statements Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
        Try adjusting your filters or check back later.
      </Text>
    </View>
  );

  const styles = createStyles(isDark);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} backgroundColor={isDark ? '#1f2937' : '#1e40af'} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
        {renderHeader()}
      </SafeAreaView>
      <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
        
        {showFilters && (
          <View style={[styles.filtersContainer, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Agent
                </Text>
                <TextInput
                  style={[styles.filterInput, { 
                    backgroundColor: isDark ? '#374151' : '#f9fafb',
                    color: isDark ? '#f3f4f6' : '#1f2937',
                    borderColor: isDark ? '#4b5563' : '#d1d5db'
                  }]}
                  placeholder="Enter agent name"
                  placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                  value={filters.agent}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, agent: text }))}
                />
              </View>

              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  PNR/Ticket
                </Text>
                <TextInput
                  style={[styles.filterInput, { 
                    backgroundColor: isDark ? '#374151' : '#f9fafb',
                    color: isDark ? '#f3f4f6' : '#1f2937',
                    borderColor: isDark ? '#4b5563' : '#d1d5db'
                  }]}
                  placeholder="Enter PNR or ticket number"
                  placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                  value={filters.ticket_number_pnr}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, ticket_number_pnr: text }))}
                />
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  From Date
                </Text>
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
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  To Date
                </Text>
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
              <View style={styles.filterItemFull}>
                <Text style={[styles.filterLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Market
                </Text>
                <View style={[styles.pickerContainer, { 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb'
                }]}>
                  <Picker
                    selectedValue={filters.market_id?.toString() || ''}
                    onValueChange={(itemValue) => setFilters(prev => ({ 
                      ...prev, 
                      market_id: itemValue ? parseInt(itemValue) : null 
                    }))}
                    style={[styles.picker, { color: isDark ? '#f3f4f6' : '#333' }]}
                    mode="dropdown"
                    dropdownIconColor={isDark ? '#9ca3af' : '#666'}
                  >
                    <Picker.Item label="All Markets" value="" />
                    {marketOptions.map((market) => (
                      <Picker.Item key={market.value} label={market.label} value={market.value.toString()} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.filterButtonsRow}>
              <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.searchButton, { backgroundColor: isDark ? '#3b82f6' : '#1e40af' }]} onPress={applyFilters}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {renderDataCount()}
        
        {loading && !refreshing ? (
          <SkeletonList itemCount={6} />
        ) : (
          <FlatList
            data={statements}
            renderItem={renderStatementItem}
            keyExtractor={(item) => `statement-${item.id}`}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {showFromDate && (
        <DateTimePicker
          value={filters.from_date ? new Date(filters.from_date) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'from')}
        />
      )}

      {showToDate && (
        <DateTimePicker
          value={filters.to_date ? new Date(filters.to_date) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'to')}
        />
      )}
    </>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  safeArea: {
    // Background color handled dynamically inline
  },
  container: {
    flex: 1,
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
  dataCountContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#e5e7eb',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
  },
  filtersContainer: {
    backgroundColor: isDark ? '#1f2937' : '#fff',
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
  filterItemFull: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#d1d5db' : '#374151',
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: isDark ? '#4b5563' : '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: isDark ? '#374151' : '#f9fafb',
    color: isDark ? '#f3f4f6' : '#1f2937',
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
  filterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  searchButton: {
    backgroundColor: isDark ? '#3b82f6' : '#1e40af',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dataCountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    flex: 0.4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    flex: 0.6,
    textAlign: 'right',
  },
  subValue: {
    fontSize: 12,
    textAlign: 'right',
  },
  monoFont: {
    fontFamily: 'monospace',
  },
  agentContainer: {
    flex: 0.6,
    alignItems: 'flex-end',
  },
  transactionContainer: {
    flex: 0.6,
    alignItems: 'flex-end',
  },
  transactionCode: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  financialContainer: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    backgroundColor: isDark ? '#374151' : '#f9fafb',
    borderRadius: 6,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  financialItem: {
    flex: 1,
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingFooter: {
    padding: 16,
    alignItems: 'center',
  },
  loadingMoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});