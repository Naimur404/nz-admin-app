import { busService } from '@/services/bus';
import { BusBookingDetails } from '@/types/bus';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

export default function BookingDetailsScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const params = useLocalSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BusBookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadBookingDetails(params.id as string);
    }
  }, [params.id]);

  const loadBookingDetails = async (uniqueTransId: string) => {
    setLoading(true);
    try {
      const response = await busService.getBookingDetails(uniqueTransId);
      setBooking(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load booking details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return styles.statusConfirmed;
      case 'CANCELED':
      case 'VOID':
        return styles.statusCanceled;
      case 'FAILED':
      case 'REJECT':
        return styles.statusFailed;
      default:
        return styles.statusDefault;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
        <ActivityIndicator size="large" color={isDark ? '#3b82f6' : '#1e40af'} />
      </View>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>Booking Details</Text>
          <View style={styles.backButton} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>Booking Information</Text>
          <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Booking ID:</Text>
              <View style={[styles.bookingIdBadge, { backgroundColor: isDark ? '#3b82f6' : '#1e40af' }]}>
                <Text style={[styles.bookingIdText, { color: '#fff' }]}>{booking.unique_trans_id}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Booking Ref:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.booking_ref_number}</Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>PNR:</Text>
              <Text style={[styles.valueSmall, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.pnr}</Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Status:</Text>
              <View style={[styles.statusBadge, getStatusColor(booking.status)]}>
                <Text style={styles.statusText}>{booking.status}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Ticket Status:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.ticket_status}</Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Booking Date:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{formatDate(booking.created_at)}</Text>
            </View>
          </View>
        </View>

        {/* Journey Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>Journey Details</Text>
          <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Operator:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.operator_name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Bus Type:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.bus_type}</Text>
            </View>

            <View style={styles.journeyRow}>
              <View style={styles.journeyPoint}>
                <Ionicons name="location" size={20} color="#10b981" />
                <View style={styles.journeyInfo}>
                  <Text style={[styles.journeyLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Boarding Point</Text>
                  <Text style={[styles.journeyLocation, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.boarding_point.location}</Text>
                  <Text style={[styles.journeyTime, { color: isDark ? '#9ca3af' : '#6b7280' }]}>{formatDate(booking.boarding_point.time)}</Text>
                </View>
              </View>

              <Ionicons name="arrow-down" size={24} color={isDark ? '#9ca3af' : '#6b7280'} style={styles.arrowIcon} />

              <View style={styles.journeyPoint}>
                <Ionicons name="location" size={20} color="#ef4444" />
                <View style={styles.journeyInfo}>
                  <Text style={[styles.journeyLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Dropping Point</Text>
                  <Text style={[styles.journeyLocation, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.dropping_point.location}</Text>
                  <Text style={[styles.journeyTime, { color: isDark ? '#9ca3af' : '#6b7280' }]}>{formatDate(booking.dropping_point.time)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Passenger Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>
            Passengers ({booking.passenger_counts.total})
          </Text>
          {booking.passengers.map((passenger, index) => (
            <View key={passenger.id} style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
              <View style={styles.passengerHeader}>
                <Text style={[styles.passengerName, { color: isDark ? '#f3f4f6' : '#111827' }]}>
                  {passenger.full_name}
                  {passenger.is_lead_passenger && (
                    <Text style={[styles.leadBadge, { color: '#10b981' }]}> (Lead)</Text>
                  )}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Seat:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{passenger.seat_number}</Text>
              </View>

              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Ticket No:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{passenger.ticket_numbers}</Text>
              </View>

              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Gender:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{passenger.gender}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Agent Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>Agent Information</Text>
          <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Agent Name:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.agent_info.agent_name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>SL No:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.agent_info.sl_no}</Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Contact:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.agent_info.contact_number}</Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Email:</Text>
              <Text style={[styles.valueSmall, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.agent_info.email}</Text>
            </View>
          </View>
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>Price Breakdown</Text>
          <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Base Price:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>
                {booking.currency} {booking.base_price}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Discount:</Text>
              <Text style={[styles.value, styles.discount, { color: isDark ? '#10b981' : '#059669' }]}>
                {booking.currency} {booking.discount_price}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Taxes:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>
                {booking.currency} {booking.taxes}
              </Text>
            </View>

            <View style={[styles.divider, { borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]} />

            <View style={styles.row}>
              <Text style={[styles.totalLabel, { color: isDark ? '#f3f4f6' : '#111827' }]}>Total Price:</Text>
              <Text style={[styles.totalValue, { color: isDark ? '#f3f4f6' : '#111827' }]}>
                {booking.currency} {booking.total_price}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Cost:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>
                {booking.currency} {booking.costing}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Profit:</Text>
              <Text style={[styles.profit, { color: isDark ? '#10b981' : '#059669' }]}>
                {booking.currency}{' '}
                {(parseFloat(booking.total_price) - parseFloat(booking.costing)).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  valueSmall: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  bookingIdBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookingIdText: {
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
  statusConfirmed: {
    backgroundColor: '#10b981',
  },
  statusCanceled: {
    backgroundColor: '#ef4444',
  },
  statusFailed: {
    backgroundColor: '#f59e0b',
  },
  statusDefault: {
    backgroundColor: '#6b7280',
  },
  journeyRow: {
    marginTop: 8,
  },
  journeyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  journeyInfo: {
    marginLeft: 12,
    flex: 1,
  },
  journeyLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  journeyLocation: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  journeyTime: {
    fontSize: 13,
  },
  arrowIcon: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  passengerHeader: {
    marginBottom: 12,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  leadBadge: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: 'normal',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
  },
  totalValue: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  profit: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  discount: {
    color: '#10b981',
  },
  bottomSpacing: {
    height: 32,
  },
});
