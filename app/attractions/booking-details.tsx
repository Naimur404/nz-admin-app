import { useTheme } from '@/hooks/use-theme';
import { attractionService } from '@/services/attraction';
import { AttractionBooking } from '@/types/attraction';
import { BookingOperationLog, OperationDetails } from '@/types/booking-operation-log';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AttractionBookingDetailsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { bookingTransId } = useLocalSearchParams<{ bookingTransId: string }>();
  const [loading, setLoading] = useState(true);
  const [operationLogs, setOperationLogs] = useState<BookingOperationLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [booking, setBooking] = useState<AttractionBooking | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
  }, [bookingTransId]);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await attractionService.getBookingDetails(bookingTransId);
      setBooking(response.data);
      
      // Load operation logs after booking details are loaded
      loadOperationLogs(bookingTransId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const loadOperationLogs = async (transactionId: string) => {
    try {
      setLogsLoading(true);
      const response = await attractionService.getBookingOperationLog(transactionId);
      setOperationLogs(response.data || []);
      console.log('Attraction operation logs loaded successfully');
    } catch (error: any) {
      console.error('Error loading operation logs:', error);
      // Don't show alert for operation logs failure, just log it
    } finally {
      setLogsLoading(false);
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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseOperationDetails = (operationDetails: string): OperationDetails | null => {
    try {
      return JSON.parse(operationDetails);
    } catch (error) {
      return null;
    }
  };

  const getOperationTypeColor = (operationType: string): string => {
    switch (operationType) {
      case 'Booking Created':
      case 'BOOKING':
        return '#10b981';
      case 'Ticket processing Process':
      case 'PAYMENT':
        return '#3b82f6';
      case 'Support Status Change':
        return '#8b5cf6';
      case 'Receipt Upload and selling info update':
        return '#f59e0b';
      case 'Cancellation':
      case 'CANCELLATION':
        return '#ef4444';
      case 'Refund':
      case 'REFUND':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const renderOperationLogItem = (log: BookingOperationLog, index: number) => {
    const operationDetails = parseOperationDetails(log.operation_details);
    const operationColor = getOperationTypeColor(log.operation_type);
    
    return (
      <View key={index} style={[styles.tableRow, { borderBottomColor: isDark ? '#374151' : '#f3f4f6' }]}>
        {/* Date & Time Column */}
        <View style={[styles.tableCell, { flex: 1.2 }]}>
          <Text style={[styles.tableCellText, { color: isDark ? '#d1d5db' : '#374151' }]}>{formatDateTime(log.created_at)}</Text>
        </View>
        
        {/* Activity Column */}
        <View style={styles.tableCell}>
          <View style={[styles.activityBadge, { backgroundColor: operationColor }]}>
            <Text style={styles.activityText}>{log.operation_type}</Text>
          </View>
        </View>
        
        {/* Description Column */}
        <View style={[styles.tableCell, { flex: 1.5 }]}>
          <Text style={[styles.tableCellText, { color: isDark ? '#d1d5db' : '#374151' }]}>
            {operationDetails ? operationDetails.remarks || operationDetails.action : log.operation_details}
          </Text>
        </View>
        
        {/* Done By Column */}
        <View style={styles.tableCell}>
          <Text style={[styles.tableCellText, { color: isDark ? '#d1d5db' : '#374151' }]}>{log.done_by}</Text>
        </View>
      </View>
    );
  };

  const renderOperationLogsTable = () => (
    <View style={[styles.tableContainer, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
      {/* Table Header */}
      <View style={[styles.tableHeader, { backgroundColor: isDark ? '#374151' : '#1e40af' }]}>
        <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
          <Text style={styles.tableHeaderText}>Date & Time</Text>
        </View>
        <View style={styles.tableHeaderCell}>
          <Text style={styles.tableHeaderText}>Activity</Text>
        </View>
        <View style={[styles.tableHeaderCell, { flex: 1.5 }]}>
          <Text style={styles.tableHeaderText}>Description</Text>
        </View>
        <View style={styles.tableHeaderCell}>
          <Text style={styles.tableHeaderText}>Done By</Text>
        </View>
      </View>
      
      {/* Table Body */}
      {operationLogs.map((log, index) => renderOperationLogItem(log, index))}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
        <ActivityIndicator size="large" color={isDark ? '#3b82f6' : '#1e40af'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
        <Text style={[styles.errorText, { color: isDark ? '#ef4444' : '#ef4444' }]}>{error}</Text>
      </View>
    );
  }

  if (!booking) {
    return null;
  }

  const { agent_info, passengers, attraction_info, fare_details } = booking;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
        <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attraction Booking Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#60a5fa' : '#1e40af' }]}>Booking Information</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Booking ID:</Text>
            <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{booking.booking_trans_id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Reference:</Text>
            <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{booking.booking_ref_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>PNR:</Text>
            <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{booking.pnr}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Status:</Text>
            <Text style={[styles.value, { color: booking.status === 'CONFIRMED' ? '#10b981' : '#ef4444' }]}>
              {booking.status}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Product:</Text>
            <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{booking.product_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Package:</Text>
            <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{booking.package_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Category:</Text>
            <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{booking.category}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Visit Date:</Text>
            <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{formatDate(booking.visited_date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Total Passengers:</Text>
            <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{booking.total_passengers}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Payment Method:</Text>
            <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{booking.payment_method}</Text>
          </View>
          <View style={[styles.row, styles.totalRow, { borderTopColor: isDark ? '#374151' : '#d1d5db' }]}>
            <Text style={[styles.totalLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Total Amount:</Text>
            <Text style={[styles.totalValue, { color: isDark ? '#60a5fa' : '#1e40af' }]}>{booking.currency} {parseFloat(booking.total_price_selling).toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Created:</Text>
            <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{formatDateTime(booking.created_at)}</Text>
          </View>
        </View>

        {agent_info && (
          <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#60a5fa' : '#1e40af' }]}>Agent Information</Text>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Agent Name:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{agent_info.agent_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Serial No:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{agent_info.sl_no}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Email:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{agent_info.email}</Text>
            </View>
            {agent_info.contact_number && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Contact:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{agent_info.contact_number}</Text>
              </View>
            )}
            {agent_info.agent_address && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Address:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{agent_info.agent_address}</Text>
              </View>
            )}
          </View>
        )}

        <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#60a5fa' : '#1e40af' }]}>Passenger Information</Text>
          {passengers.map((p, index) => (
            <View key={p.id} style={[styles.passengerCard, { 
              backgroundColor: isDark ? '#374151' : '#f9fafb', 
              borderColor: isDark ? '#4b5563' : '#e5e7eb' 
            }]}>
              <View style={[styles.passengerHeader, { borderBottomColor: isDark ? '#4b5563' : '#e5e7eb' }]}>
                <Text style={[styles.passengerName, { color: isDark ? '#f3f4f6' : '#374151' }]}>
                  {p.full_name}
                </Text>
                {p.is_lead_passenger && (
                  <Text style={styles.leadBadge}>LEAD</Text>
                )}
              </View>
              <View style={styles.passengerDetails}>
                <View style={styles.row}>
                  <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Gender:</Text>
                  <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{p.gender}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Date of Birth:</Text>
                  <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{formatDate(p.date_of_birth)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Email:</Text>
                  <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{p.email}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Phone:</Text>
                  <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{p.phone}</Text>
                </View>
                {p.ticket_number && (
                  <>
                    <View style={styles.row}>
                      <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Ticket Number:</Text>
                      <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{p.ticket_number}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Ticket Status:</Text>
                      <Text style={[styles.value, { color: p.ticket_status === 'ISSUED' ? '#10b981' : '#f59e0b' }]}>
                        {p.ticket_status}
                      </Text>
                    </View>
                    {p.ticket_format && (
                      <View style={styles.row}>
                        <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Ticket Format:</Text>
                        <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{p.ticket_format}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          ))}
        </View>

        {attraction_info && (
          <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#60a5fa' : '#1e40af' }]}>Attraction Information</Text>
            
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: isDark ? '#f3f4f6' : '#374151' }]}>Product Details</Text>
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Product:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{attraction_info.ProductName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Package:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{attraction_info.PackageName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Category:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{attraction_info.Category}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Visit Date:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{attraction_info.VisitedDate}</Text>
              </View>
              {attraction_info.Duration > 0 && (
                <View style={styles.row}>
                  <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Duration:</Text>
                  <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{attraction_info.Duration} hours</Text>
                </View>
              )}
            </View>

            {attraction_info.Inclusions && attraction_info.Inclusions.length > 0 && (
              <View style={styles.subsection}>
                <Text style={[styles.subsectionTitle, { color: isDark ? '#f3f4f6' : '#374151' }]}>Inclusions</Text>
                {attraction_info.Inclusions.map((inc: string, idx: number) => (
                  <Text key={idx} style={[styles.bulletPoint, { color: isDark ? '#d1d5db' : '#4b5563' }]}>• {inc}</Text>
                ))}
              </View>
            )}

            {attraction_info.HowToUse && attraction_info.HowToUse.length > 0 && (
              <View style={styles.subsection}>
                <Text style={[styles.subsectionTitle, { color: isDark ? '#f3f4f6' : '#374151' }]}>How To Use</Text>
                {attraction_info.HowToUse.map((how: string, idx: number) => (
                  <Text key={idx} style={[styles.bulletPoint, { color: isDark ? '#d1d5db' : '#4b5563' }]}>• {how}</Text>
                ))}
              </View>
            )}

            {attraction_info.CancleablePolicy && attraction_info.CancleablePolicy.length > 0 && (
              <View style={styles.subsection}>
                <Text style={[styles.subsectionTitle, { color: isDark ? '#f3f4f6' : '#374151' }]}>Cancellation Policy</Text>
                {attraction_info.CancleablePolicy.map((pol: string, idx: number) => (
                  <Text key={idx} style={[styles.bulletPoint, { color: isDark ? '#d1d5db' : '#4b5563' }]}>• {pol}</Text>
                ))}
              </View>
            )}

            {attraction_info.TermsAndConditions && (
              <View style={styles.subsection}>
                <Text style={[styles.subsectionTitle, { color: isDark ? '#f3f4f6' : '#374151' }]}>Terms & Conditions</Text>
                <Text style={[styles.termsText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>{attraction_info.TermsAndConditions}</Text>
              </View>
            )}
          </View>
        )}

        {fare_details && fare_details.length > 0 && (
          <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#60a5fa' : '#1e40af' }]}>Fare Breakdown</Text>
            {fare_details.map((fare, idx) => (
              <View key={idx} style={[styles.fareCard, { 
                backgroundColor: isDark ? '#374151' : '#f9fafb', 
                borderColor: isDark ? '#4b5563' : '#e5e7eb' 
              }]}>
                <View style={styles.row}>
                  <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Passenger Type:</Text>
                  <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{fare.Type}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Count:</Text>
                  <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{fare.Count}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Base Price:</Text>
                  <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{booking.currency} {fare.BasePrice.toLocaleString()}</Text>
                </View>
                {fare.Taxes > 0 && (
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Taxes:</Text>
                    <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>{booking.currency} {fare.Taxes.toLocaleString()}</Text>
                  </View>
                )}
                {fare.DiscountPrice > 0 && (
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#666' }]}>Discount:</Text>
                    <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#333' }]}>-{booking.currency} {fare.DiscountPrice.toLocaleString()}</Text>
                  </View>
                )}
                <View style={[styles.row, styles.totalRow, { borderTopColor: isDark ? '#4b5563' : '#d1d5db' }]}>
                  <Text style={[styles.totalLabel, { color: isDark ? '#f3f4f6' : '#374151' }]}>Total:</Text>
                  <Text style={[styles.totalValue, { color: isDark ? '#60a5fa' : '#1e40af' }]}>{booking.currency} {fare.TotalPrice.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Booking Operation Log */}
        <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#374151' }]}>Booking Operation Log</Text>
          {logsLoading ? (
            <ActivityIndicator size="small" color={isDark ? '#3b82f6' : '#1e40af'} style={styles.logsLoading} />
          ) : operationLogs.length > 0 ? (
            renderOperationLogsTable()
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>No operation logs available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  passengerCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  passengerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  passengerName: {
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
  },
  leadBadge: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  passengerDetails: {
    gap: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'justify',
  },
  fareCard: {
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  // Operation Log Table Styles
  tableContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 11,
    textAlign: 'center',
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  activityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  logsLoading: {
    padding: 20,
  },
});
