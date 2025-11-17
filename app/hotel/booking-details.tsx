import { useTheme } from '@/hooks/use-theme';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
      <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]} edges={['top']}>
          <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: '#fff' }]}>Hotel Booking Details</Text>
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#3b82f6' : '#1e40af'} />
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]} edges={['top']}>
          <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: '#fff' }]}>Hotel Booking Details</Text>
          </View>
        </SafeAreaView>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Booking not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>Hotel Booking Details</Text>
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
          <View style={[styles.bookingHeader, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
            <View style={styles.bookingIdContainer}>
              <Text style={[styles.bookingIdLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Booking ID</Text>
              <Text style={[styles.bookingIdValue, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.unique_trans_id}</Text>
            </View>
            <View style={[styles.statusBadge, getStatusColor(booking.status)]}>
              <Text style={styles.statusText}>{booking.status}</Text>
            </View>
          </View>
        </View>

        {/* Hotel Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>Hotel Information</Text>
          <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Hotel Name:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.hotel_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>City:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.city}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Address:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.address}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Phone:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.hotel_phone_number}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Email:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.hotel_email_address}</Text>
            </View>
          </View>
        </View>

        {/* Booking Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>Booking Information</Text>
          <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Booking Date:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{formatDateTime(booking.booking_date)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Check In:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{formatDate(booking.check_in)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Check Out:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{formatDate(booking.check_out)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Platform Type:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.platform_type}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Reference No:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.reference_no}</Text>
            </View>
          </View>
        </View>

        {/* Guest Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>Guest Information</Text>
          <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Lead Guest:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.lead_pax_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Guest Email:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.guest_email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Contact No:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.contact_no}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Total Guests:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.guests.length}</Text>
            </View>
          </View>
        </View>

        {/* Room Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>Room Information</Text>
          {booking.rooms.map((room, index) => (
            <View key={room.id} style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Room {room.room_no}:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{room.room_type}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Status:</Text>
                <Text style={[styles.value, styles.price, { color: isDark ? '#10b981' : '#059669' }]}>{room.booking_status}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Price:</Text>
                <Text style={[styles.value, styles.price, { color: isDark ? '#10b981' : '#059669' }]}>
                  {room.currency} {parseFloat(room.price).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Guest List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>Guest List</Text>
          {booking.guests.map((guest, index) => (
            <View key={guest.id} style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Name:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{guest.full_name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Type:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{guest.type} {guest.is_lead ? '(Lead)' : ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Room:</Text>
                <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{guest.room_no}</Text>
              </View>
              {guest.type === 'Child' && (
                <View style={styles.row}>
                  <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Age:</Text>
                  <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{guest.child_age} years</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Financial Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>Financial Information</Text>
          <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Selling Price:</Text>
              <Text style={[styles.value, styles.price, { color: isDark ? '#10b981' : '#059669' }]}>
                {booking.price_breakdown.currency} {parseFloat(booking.total_price_selling).toFixed(2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Original Price:</Text>
              <Text style={[styles.value, styles.price, { color: isDark ? '#10b981' : '#059669' }]}>
                {booking.original_price_breakdown.original_currency} {parseFloat(booking.original_total_price).toFixed(2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Payment Method:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.payment_method}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Transaction Status:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{booking.trans_status}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Customer Payment:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>
                {booking.price_breakdown.currency} {parseFloat(booking.pay_amount_from_customer).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#111827' }]}>Additional Information</Text>
          <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Booking Time Limit:</Text>
              <Text style={[styles.value, { color: isDark ? '#f3f4f6' : '#111827' }]}>{formatDateTime(booking.booking_time_limit)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: '#fff' }]}>Status Date:</Text>
              <Text style={[styles.value, { color: '#fff' }]}>{formatDateTime(booking.status_date)}</Text>
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
            <Text style={[
              styles.sectionTitle,
              { color: isDark ? '#60a5fa' : '#1e40af' }
            ]}>Cancellation Policies</Text>
            {booking.cancellation_policies.map((policy, index) => (
              <View key={policy.id} style={[
                styles.card,
                { backgroundColor: isDark ? '#1f2937' : '#fff' }
              ]}>
                <View style={styles.row}>
                  <Text style={[
                    styles.label,
                    { color: isDark ? '#9ca3af' : '#666' }
                  ]}>Period:</Text>
                  <Text style={[
                    styles.value,
                    { color: isDark ? '#f3f4f6' : '#333' }
                  ]}>{policy.from_date} to {policy.to_date}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[
                    styles.label,
                    { color: isDark ? '#9ca3af' : '#666' }
                  ]}>Cancellation Price:</Text>
                  <Text style={[styles.value, styles.price]}>
                    {policy.currency} {parseFloat(policy.cancellation_price).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={[
                    styles.label,
                    { color: isDark ? '#9ca3af' : '#666' }
                  ]}>Information:</Text>
                  <Text style={[
                    styles.value,
                    { color: isDark ? '#f3f4f6' : '#333' }
                  ]}>{policy.essential_information}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Important Information */}
        {booking.must_know_info.generalInfo && (
          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              { color: isDark ? '#60a5fa' : '#1e40af' }
            ]}>Important Information</Text>
            <View style={[
              styles.card,
              { backgroundColor: isDark ? '#1f2937' : '#fff' }
            ]}>
              <Text style={[
                styles.generalInfo,
                { color: isDark ? '#f3f4f6' : '#333' }
              ]}>{booking.must_know_info.generalInfo}</Text>
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
  },
  safeArea: {
  },
  header: {
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
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingHeader: {
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
    marginBottom: 4,
  },
  bookingIdValue: {
    fontSize: 18,
    fontWeight: 'bold',
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
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
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
    lineHeight: 20,
  },
});