import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';
import { flightService } from '@/services/flight';
import { BookingOperationLog, OperationDetails } from '@/types/booking-operation-log';
import { FlightBookingDetails } from '@/types/flight-details';

const { width } = Dimensions.get('window');

export default function FlightBookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [bookingDetails, setBookingDetails] = useState<FlightBookingDetails | null>(null);
  const [operationLogs, setOperationLogs] = useState<BookingOperationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    loadBookingDetails();
  }, []);

  const loadBookingDetails = async () => {
    if (!id) {
      Alert.alert('Error', 'Booking transaction reference is required');
      router.back();
      return;
    }

    try {
      setLoading(true);
      const response = await flightService.getBookingDetails(id);
      console.log('Flight booking details loaded successfully');
      console.log('Directions structure:', response.data?.FlightInfo?.Directions);
      console.log('Number of direction groups:', response.data?.FlightInfo?.Directions?.length);
      if (response.data?.FlightInfo?.Directions?.[0]) {
        console.log('First direction group:', response.data.FlightInfo.Directions[0]);
        console.log('Number of directions in first group:', response.data.FlightInfo.Directions[0].length);
      }
      setBookingDetails(response.data);
      
      // Load operation logs after booking details are loaded
      loadOperationLogs(id);
    } catch (error) {
      console.error('Error loading booking details:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const loadOperationLogs = async (bookingTransactionRef: string) => {
    try {
      setLogsLoading(true);
      const response = await flightService.getBookingOperationLog(bookingTransactionRef);
      setOperationLogs(response.data || []);
    } catch (error) {
      console.error('Error loading operation logs:', error);
      // Don't show alert for logs error, just log it
    } finally {
      setLogsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'dd MMM yyyy, hh:mm a');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'hh:mm a');
    } catch {
      return dateString;
    }
  };

  const formatDateOnly = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const getAirlineImageUrl = (carrierCode: string) => {
    return `https://s3.ap-southeast-1.amazonaws.com/cdn.nztrip.co/Airlineslogos/${carrierCode}.png`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const parseOperationDetails = (detailsJson: string): OperationDetails | null => {
    try {
      return JSON.parse(detailsJson);
    } catch {
      return null;
    }
  };

  const formatOperationType = (type: string) => {
    return type;
  };

  const getOperationTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'booking initiate':
        return '#3b82f6';
      case 'air booking':
        return '#10b981';
      case 'ticket price':
        return '#f59e0b';
      case 'payment status':
        return '#8b5cf6';
      case 'ticketing request':
        return '#06b6d4';
      case 'on call':
        return '#f97316';
      case 'ticketing approved':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const renderOperationLogItem = (log: BookingOperationLog, index: number) => {
    const operationDetails = parseOperationDetails(log.operation_details);
    const operationColor = getOperationTypeColor(log.operation_type);
    
    return (
      <View key={index} style={styles.tableRow}>
        {/* Date & Time Column */}
        <View style={[styles.tableCell, { flex: 1.2 }]}>
          <Text style={styles.tableCellText}>{formatDate(log.created_at)}</Text>
        </View>
        
        {/* Activity Column */}
        <View style={styles.tableCell}>
          <View style={[styles.activityBadge, { backgroundColor: operationColor }]}>
            <Text style={styles.activityText}>{log.operation_type}</Text>
          </View>
        </View>
        
        {/* Description Column */}
        <View style={[styles.tableCell, { flex: 1.5 }]}>
          <Text style={styles.tableCellText}>
            {operationDetails ? operationDetails.remarks || operationDetails.action : log.operation_details}
          </Text>
        </View>
        
        {/* Done By Column */}
        <View style={styles.tableCell}>
          <Text style={styles.tableCellText}>{log.done_by}</Text>
        </View>
      </View>
    );
  };

  const renderOperationLogsTable = () => (
    <View style={styles.tableContainer}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
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

  const renderPassengerInfo = (ticketInfo: any, index: number) => (
    <View key={index} style={styles.passengerCard}>
      <View style={styles.passengerHeader}>
        <Text style={[styles.passengerTitle, { color: textColor }]}>
          Passenger {index + 1}
        </Text>
        <Text style={[styles.ticketNumber, { color: tintColor }]}>
          Ticket: {ticketInfo.TicketNumbers?.join(', ') || 'N/A'}
        </Text>
      </View>

      <View style={styles.passengerDetails}>
        <Text style={[styles.passengerName, { color: textColor }]}>
          {ticketInfo.PassengerInfo?.NameElement?.Title} {ticketInfo.PassengerInfo?.NameElement?.FirstName} {ticketInfo.PassengerInfo?.NameElement?.LastName}
        </Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Gender:</Text>
          <Text style={[styles.detailValue, { color: textColor }]}>
            {ticketInfo.PassengerInfo?.Gender}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date of Birth:</Text>
          <Text style={[styles.detailValue, { color: textColor }]}>
            {ticketInfo.PassengerInfo?.DateOfBirth}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Document:</Text>
          <Text style={[styles.detailValue, { color: textColor }]}>
            {ticketInfo.PassengerInfo?.DocumentInfo?.DocumentType?.toUpperCase()} - {ticketInfo.PassengerInfo?.DocumentInfo?.DocumentNumber}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Nationality:</Text>
          <Text style={[styles.detailValue, { color: textColor }]}>
            {ticketInfo.PassengerInfo?.DocumentInfo?.Nationality}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Contact:</Text>
          <Text style={[styles.detailValue, { color: textColor }]}>
            {ticketInfo.PassengerInfo?.ContactInfo?.Email}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFlightSegment = (segment: any, index: number) => {
    if (!segment) return null;
    
    return (
    <View key={index} style={styles.segmentCard}>
      <View style={styles.flightHeader}>
        {segment.AirlineCode && (
          <Image
            source={{ uri: getAirlineImageUrl(segment.AirlineCode) }}
            style={styles.airlineImage}
            resizeMode="contain"
          />
        )}
        <View style={styles.flightInfo}>
          <Text style={[styles.flightNumber, { color: textColor }]}>
            {segment.Airline || 'N/A'} {segment.FlightNumber || 'N/A'}
          </Text>
          <Text style={styles.flightClass}>{segment.ServiceClass || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <Text style={[styles.airportCode, { color: textColor }]}>{segment.Origin || 'N/A'}</Text>
          <Text style={styles.airportName}>{segment.OriginName || 'N/A'}</Text>
          <Text style={[styles.flightTime, { color: tintColor }]}>
            {segment.Departure ? formatTime(segment.Departure) : 'N/A'}
          </Text>
          <Text style={styles.flightDate}>
            {segment.Departure ? formatDateOnly(segment.Departure) : 'N/A'}
          </Text>
        </View>

        <View style={styles.flightPath}>
          <View style={styles.flightLine} />
          <Ionicons name="airplane" size={20} color={tintColor} style={styles.airplaneIcon} />
          <Text style={styles.duration}>{segment.Duration?.join(', ') || 'N/A'}</Text>
        </View>

        <View style={styles.routePoint}>
          <Text style={[styles.airportCode, { color: textColor }]}>{segment.Destination || 'N/A'}</Text>
          <Text style={styles.airportName}>{segment.DestinationName || 'N/A'}</Text>
          <Text style={[styles.flightTime, { color: tintColor }]}>
            {segment.Arrival ? formatTime(segment.Arrival) : 'N/A'}
          </Text>
          <Text style={styles.flightDate}>
            {segment.Arrival ? formatDateOnly(segment.Arrival) : 'N/A'}
          </Text>
        </View>
      </View>

      {segment.Baggage && segment.Baggage.length > 0 && (
        <View style={styles.baggageInfo}>
          <Text style={styles.baggageTitle}>Baggage Allowance</Text>
          {segment.Baggage.map((baggage: any, idx: number) => (
            <Text key={idx} style={styles.baggageText}>
              {baggage.Amount} {baggage.Units} for {baggage.PassengerTypeCode}
            </Text>
          ))}
        </View>
      )}
    </View>
    );
  };

  const renderPriceBreakdown = () => (
    <View style={styles.priceCard}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Price Breakdown</Text>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Base Fare</Text>
        <Text style={[styles.priceValue, { color: textColor }]}>
          {bookingDetails?.currency} {bookingDetails?.FlightInfo?.TicketPriceComponent?.BasePrice}
        </Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Taxes & Fees</Text>
        <Text style={[styles.priceValue, { color: textColor }]}>
          {bookingDetails?.currency} {bookingDetails?.FlightInfo?.TicketPriceComponent?.Taxes}
        </Text>
      </View>

      {bookingDetails?.FlightInfo?.TicketPriceComponent?.ExtraServiceCharge !== '0.00' && (
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Service Charge</Text>
          <Text style={[styles.priceValue, { color: textColor }]}>
            {bookingDetails?.currency} {bookingDetails?.FlightInfo?.TicketPriceComponent?.ExtraServiceCharge}
          </Text>
        </View>
      )}

      <View style={[styles.priceRow, styles.totalRow]}>
        <Text style={[styles.totalLabel, { color: textColor }]}>Total Amount</Text>
        <Text style={[styles.totalValue, { color: tintColor }]}>
          {bookingDetails?.currency} {bookingDetails?.FlightInfo?.TicketPriceComponent?.TotalPrice}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!bookingDetails) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load booking details</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: tintColor }]} onPress={loadBookingDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flight Booking Details</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        {bookingDetails && (
          <View style={styles.heroSection}>
            <View style={styles.flightRoute}>
              {bookingDetails.FlightInfo?.Directions?.[0]?.[0] && (
                <>
                  <View style={styles.routeInfo}>
                    <Text style={styles.airportCodeLarge}>{bookingDetails.FlightInfo.Directions[0][0].Origin}</Text>
                    <Text style={styles.cityName}>{bookingDetails.FlightInfo.Directions[0][0].OriginName}</Text>
                  </View>
                  <View style={styles.routeArrow}>
                    <Ionicons name="airplane" size={32} color="#fff" />
                  </View>
                  <View style={styles.routeInfo}>
                    <Text style={styles.airportCodeLarge}>{bookingDetails.FlightInfo.Directions[0][0].Destination}</Text>
                    <Text style={styles.cityName}>{bookingDetails.FlightInfo.Directions[0][0].DestinationName}</Text>
                  </View>
                </>
              )}
            </View>
            <View style={styles.bookingInfoHeader}>
              <Text style={styles.bookingRefLarge}>Booking Ref: {bookingDetails.BookingTransactionRef}</Text>
              <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(bookingDetails.BookingStatus) }]}>
                <Text style={styles.statusTextLarge}>{bookingDetails.BookingStatus}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Booking Status Header */}
        <View style={styles.statusHeader}>
          <View style={styles.statusRow}>
            <Text style={[styles.bookingRef, { color: textColor }]}>
              PNR: {bookingDetails?.PNR}
            </Text>
            <Text style={styles.bookingTime}>
              Booked: {bookingDetails ? formatDate(bookingDetails.BookingTime) : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Flight Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Flight Details</Text>
          {bookingDetails.FlightInfo?.Directions?.map((directionGroup: any[], groupIndex: number) => 
            directionGroup?.map((direction: any, dirIndex: number) => (
              <View key={`${groupIndex}-${dirIndex}`}>
                {direction?.Segments?.map((segment: any, segIndex: number) => 
                  renderFlightSegment(segment, segIndex)
                )}
              </View>
            ))
          )}
          {/* Fallback if no flight directions are available */}
          {(!bookingDetails.FlightInfo?.Directions || bookingDetails.FlightInfo.Directions.length === 0) && (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: textColor }]}>No flight information available</Text>
            </View>
          )}
        </View>

        {/* Passenger Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Passenger Information</Text>
          {bookingDetails.TicketInfoes?.map((ticketInfo: any, index: number) => 
            renderPassengerInfo(ticketInfo, index)
          )}
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          {renderPriceBreakdown()}
        </View>

        {/* Agent Information */}
        {bookingDetails.agent_info && (
          <View style={styles.section}>
            <View style={styles.agentCard}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Agent Information</Text>
              <Text style={[styles.agentName, { color: textColor }]}>
                {bookingDetails.agent_info.agent_name}
              </Text>
              <Text style={styles.agentContact}>
                {bookingDetails.agent_info.Email}
              </Text>
              {bookingDetails.agent_info.Phone && (
                <Text style={styles.agentContact}>
                  {bookingDetails.agent_info.PhoneCountryCode} {bookingDetails.agent_info.Phone}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Additional Information */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Additional Information</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Status:</Text>
              <Text style={[styles.detailValue, { color: getStatusColor(bookingDetails.PaymentStatus) }]}>
                {bookingDetails.PaymentStatus}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ticket Status:</Text>
              <Text style={[styles.detailValue, { color: getStatusColor(bookingDetails.TicketStatus) }]}>
                {bookingDetails.TicketStatus}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Support Status:</Text>
              <Text style={[styles.detailValue, { color: textColor }]}>
                {bookingDetails.SupportStatus}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Refundable:</Text>
              <Text style={[styles.detailValue, { color: bookingDetails.Refundable ? '#22c55e' : '#ef4444' }]}>
                {bookingDetails.Refundable ? 'Yes' : 'No'}
              </Text>
            </View>

            {bookingDetails.IssueTime && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Issue Time:</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {formatDate(bookingDetails.IssueTime)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Booking Operation Log */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Booking Operation Log</Text>
          {logsLoading ? (
            <ActivityIndicator size="small" color={tintColor} style={styles.logsLoading} />
          ) : operationLogs.length > 0 ? (
            renderOperationLogsTable()
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: textColor }]}>No operation logs available</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e40af',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  heroSection: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  routeInfo: {
    alignItems: 'center',
    flex: 1,
  },
  routeArrow: {
    paddingHorizontal: 20,
  },
  airportCodeLarge: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cityName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  bookingInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingRefLarge: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  statusBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusTextLarge: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  statusHeader: {
    padding: 16,
    backgroundColor: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingRef: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  pnrText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  segmentCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  flightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  airlineImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  flightInfo: {
    flex: 1,
  },
  flightNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  flightClass: {
    fontSize: 12,
    color: '#6b7280',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routePoint: {
    flex: 1,
    alignItems: 'center',
  },
  airportCode: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  airportName: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  flightTime: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  flightDate: {
    fontSize: 10,
    color: '#6b7280',
  },
  flightPath: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  flightLine: {
    height: 1,
    backgroundColor: '#d1d5db',
    width: '100%',
    marginBottom: 4,
  },
  airplaneIcon: {
    marginBottom: 4,
  },
  duration: {
    fontSize: 10,
    color: '#6b7280',
  },
  baggageInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  baggageTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  baggageText: {
    fontSize: 12,
    color: '#6b7280',
  },
  passengerCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  passengerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  passengerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  ticketNumber: {
    fontSize: 12,
    fontWeight: '500',
  },
  passengerDetails: {
    gap: 8,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  priceCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  agentCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  agentContact: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataText: {
    fontSize: 16,
    color: '#6b7280',
  },
  logsLoading: {
    marginVertical: 20,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'left',
    lineHeight: 16,
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
    minWidth: 60,
  },
  activityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});