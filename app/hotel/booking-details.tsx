import { hotelService } from '@/services/hotel';
import { HotelBookingDetails } from '@/types/hotel';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HotelBookingDetailsScreen() {
  const router = useRouter();
  const { transactionId } = useLocalSearchParams();
  const [booking, setBooking] = useState<HotelBookingDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transactionId) {
      loadBookingDetails();
    }
  }, [transactionId]);

  const loadBookingDetails = async () => {
    setLoading(true);
    try {
      const bookingData = await hotelService.getBookingDetails(transactionId as string);
      setBooking(bookingData);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return { backgroundColor: '#10b981' };
      case 'CANCELLED':
      case 'VOID':
        return { backgroundColor: '#ef4444' };
      case 'FAILED':
        return { backgroundColor: '#f59e0b' };
      case 'PENDING':
        return { backgroundColor: '#6b7280' };
      default:
        return { backgroundColor: '#6b7280' };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hotel Booking Details</Text>
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hotel Booking Details</Text>
          </View>
        </SafeAreaView>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hotel Booking Details</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {/* Hotel Image */}
        <View style={styles.section}>
          <Image
            source={{ uri: booking.hero_image_url }}
            style={styles.hotelImage}
            resizeMode="cover"
          />
        </View>

        {/* Booking ID and Status */}
        <View style={styles.section}>
          <View style={styles.bookingHeader}>
            <View style={styles.bookingIdContainer}>
              <Text style={styles.bookingIdLabel}>Booking ID</Text>
              <Text style={styles.bookingIdValue}>{booking.unique_trans_id}</Text>
            </View>
            <View style={[styles.statusBadge, getStatusColor(booking.status)]}>
              <Text style={styles.statusText}>{booking.status}</Text>
            </View>
          </View>
        </View>

        {/* Hotel Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hotel Information</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Hotel Name:</Text>
              <Text style={styles.value}>{booking.hotel_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>City:</Text>
              <Text style={styles.value}>{booking.city}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{booking.address}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{booking.hotel_phone_number}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{booking.hotel_email_address}</Text>
            </View>
          </View>
        </View>

        {/* Booking Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Booking Date:</Text>
              <Text style={styles.value}>{formatDateTime(booking.booking_date)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Check In:</Text>
              <Text style={styles.value}>{formatDate(booking.check_in)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Check Out:</Text>
              <Text style={styles.value}>{formatDate(booking.check_out)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Platform Type:</Text>
              <Text style={styles.value}>{booking.platform_type}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Reference No:</Text>
              <Text style={styles.value}>{booking.reference_no}</Text>
            </View>
          </View>
        </View>

        {/* Guest Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Information</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Lead Guest:</Text>
              <Text style={styles.value}>{booking.lead_pax_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Guest Email:</Text>
              <Text style={styles.value}>{booking.guest_email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Contact No:</Text>
              <Text style={styles.value}>{booking.contact_no}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total Guests:</Text>
              <Text style={styles.value}>{booking.guests.length}</Text>
            </View>
          </View>
        </View>

        {/* Room Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room Information</Text>
          {booking.rooms.map((room, index) => (
            <View key={room.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Room {room.room_no}:</Text>
                <Text style={styles.value}>{room.room_type}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status:</Text>
                <Text style={[styles.value, styles.price]}>{room.booking_status}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Price:</Text>
                <Text style={[styles.value, styles.price]}>
                  {room.currency} {parseFloat(room.price).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Guest List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest List</Text>
          {booking.guests.map((guest, index) => (
            <View key={guest.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{guest.full_name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Type:</Text>
                <Text style={styles.value}>{guest.type} {guest.is_lead ? '(Lead)' : ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Room:</Text>
                <Text style={styles.value}>{guest.room_no}</Text>
              </View>
              {guest.type === 'Child' && (
                <View style={styles.row}>
                  <Text style={styles.label}>Age:</Text>
                  <Text style={styles.value}>{guest.child_age} years</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Financial Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Information</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Selling Price:</Text>
              <Text style={[styles.value, styles.price]}>
                {booking.price_breakdown.currency} {parseFloat(booking.total_price_selling).toFixed(2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Original Price:</Text>
              <Text style={[styles.value, styles.price]}>
                {booking.original_price_breakdown.original_currency} {parseFloat(booking.original_total_price).toFixed(2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Payment Method:</Text>
              <Text style={styles.value}>{booking.payment_method}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Transaction Status:</Text>
              <Text style={styles.value}>{booking.trans_status}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Customer Payment:</Text>
              <Text style={styles.value}>
                {booking.price_breakdown.currency} {parseFloat(booking.pay_amount_from_customer).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Booking Time Limit:</Text>
              <Text style={styles.value}>{formatDateTime(booking.booking_time_limit)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status Date:</Text>
              <Text style={styles.value}>{formatDateTime(booking.status_date)}</Text>
            </View>
            {booking.agent_request_status && (
              <View style={styles.row}>
                <Text style={styles.label}>Request Status:</Text>
                <Text style={styles.value}>{booking.agent_request_status}</Text>
              </View>
            )}
            {booking.refund_time_limit && (
              <View style={styles.row}>
                <Text style={styles.label}>Refund Time Limit:</Text>
                <Text style={styles.value}>{formatDateTime(booking.refund_time_limit)}</Text>
              </View>
            )}
            {booking.support_date_time && (
              <View style={styles.row}>
                <Text style={styles.label}>Support Date:</Text>
                <Text style={styles.value}>{formatDateTime(booking.support_date_time)}</Text>
              </View>
            )}
            {booking.remarks_for_payment && (
              <View style={styles.row}>
                <Text style={styles.label}>Payment Remarks:</Text>
                <Text style={styles.value}>{booking.remarks_for_payment}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Cancellation Policies */}
        {booking.cancellation_policies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation Policies</Text>
            {booking.cancellation_policies.map((policy, index) => (
              <View key={policy.id} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Period:</Text>
                  <Text style={styles.value}>{policy.from_date} to {policy.to_date}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Cancellation Price:</Text>
                  <Text style={[styles.value, styles.price]}>
                    {policy.currency} {parseFloat(policy.cancellation_price).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Information:</Text>
                  <Text style={styles.value}>{policy.essential_information}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Important Information */}
        {booking.must_know_info.generalInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Important Information</Text>
            <View style={styles.card}>
              <Text style={styles.generalInfo}>{booking.must_know_info.generalInfo}</Text>
            </View>
          </View>
        )}
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
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingHeader: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingIdContainer: {
    flex: 1,
  },
  bookingIdLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingIdValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
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
  price: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  hotelImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  generalInfo: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});