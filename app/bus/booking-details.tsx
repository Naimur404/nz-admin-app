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

export default function BookingDetailsScreen() {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={styles.backButton} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Booking ID:</Text>
              <View style={styles.bookingIdBadge}>
                <Text style={styles.bookingIdText}>{booking.unique_trans_id}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Booking Ref:</Text>
              <Text style={styles.value}>{booking.booking_ref_number}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>PNR:</Text>
              <Text style={styles.valueSmall}>{booking.pnr}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <View style={[styles.statusBadge, getStatusColor(booking.status)]}>
                <Text style={styles.statusText}>{booking.status}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Ticket Status:</Text>
              <Text style={styles.value}>{booking.ticket_status}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Booking Date:</Text>
              <Text style={styles.value}>{formatDate(booking.created_at)}</Text>
            </View>
          </View>
        </View>

        {/* Journey Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journey Details</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Operator:</Text>
              <Text style={styles.value}>{booking.operator_name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Bus Type:</Text>
              <Text style={styles.value}>{booking.bus_type}</Text>
            </View>

            <View style={styles.journeyRow}>
              <View style={styles.journeyPoint}>
                <Ionicons name="location" size={20} color="#10b981" />
                <View style={styles.journeyInfo}>
                  <Text style={styles.journeyLabel}>Boarding Point</Text>
                  <Text style={styles.journeyLocation}>{booking.boarding_point.location}</Text>
                  <Text style={styles.journeyTime}>{formatDate(booking.boarding_point.time)}</Text>
                </View>
              </View>

              <Ionicons name="arrow-down" size={24} color="#6b7280" style={styles.arrowIcon} />

              <View style={styles.journeyPoint}>
                <Ionicons name="location" size={20} color="#ef4444" />
                <View style={styles.journeyInfo}>
                  <Text style={styles.journeyLabel}>Dropping Point</Text>
                  <Text style={styles.journeyLocation}>{booking.dropping_point.location}</Text>
                  <Text style={styles.journeyTime}>{formatDate(booking.dropping_point.time)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Passenger Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Passengers ({booking.passenger_counts.total})
          </Text>
          {booking.passengers.map((passenger, index) => (
            <View key={passenger.id} style={styles.card}>
              <View style={styles.passengerHeader}>
                <Text style={styles.passengerName}>
                  {passenger.full_name}
                  {passenger.is_lead_passenger && (
                    <Text style={styles.leadBadge}> (Lead)</Text>
                  )}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Seat:</Text>
                <Text style={styles.value}>{passenger.seat_number}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Ticket No:</Text>
                <Text style={styles.value}>{passenger.ticket_numbers}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Gender:</Text>
                <Text style={styles.value}>{passenger.gender}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Agent Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent Information</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Agent Name:</Text>
              <Text style={styles.value}>{booking.agent_info.agent_name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>SL No:</Text>
              <Text style={styles.value}>{booking.agent_info.sl_no}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{booking.agent_info.contact_number}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.valueSmall}>{booking.agent_info.email}</Text>
            </View>
          </View>
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Base Price:</Text>
              <Text style={styles.value}>
                {booking.currency} {booking.base_price}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Discount:</Text>
              <Text style={[styles.value, styles.discount]}>
                {booking.currency} {booking.discount_price}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Taxes:</Text>
              <Text style={styles.value}>
                {booking.currency} {booking.taxes}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total Price:</Text>
              <Text style={styles.totalValue}>
                {booking.currency} {booking.total_price}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Cost:</Text>
              <Text style={styles.value}>
                {booking.currency} {booking.costing}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Profit:</Text>
              <Text style={styles.profit}>
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
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    backgroundColor: '#1e40af',
  },
  header: {
    backgroundColor: '#1e40af',
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
    color: '#fff',
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
    color: '#333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  valueSmall: {
    fontSize: 11,
    color: '#333',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
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
    color: '#666',
    marginBottom: 4,
  },
  journeyLocation: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  journeyTime: {
    fontSize: 13,
    color: '#666',
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
