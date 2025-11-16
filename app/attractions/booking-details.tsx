import { attractionService } from '@/services/attraction';
import { AttractionBooking } from '@/types/attraction';
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
  const { bookingTransId } = useLocalSearchParams<{ bookingTransId: string }>();
  const [loading, setLoading] = useState(true);
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load details');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!booking) {
    return null;
  }

  const { agent_info, passengers, attraction_info, fare_details } = booking;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attraction Booking Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Booking ID:</Text>
            <Text style={styles.value}>{booking.booking_trans_id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Reference:</Text>
            <Text style={styles.value}>{booking.booking_ref_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PNR:</Text>
            <Text style={styles.value}>{booking.pnr}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, { color: booking.status === 'CONFIRMED' ? '#10b981' : '#ef4444' }]}>
              {booking.status}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Product:</Text>
            <Text style={styles.value}>{booking.product_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Package:</Text>
            <Text style={styles.value}>{booking.package_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.value}>{booking.category}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Visit Date:</Text>
            <Text style={styles.value}>{formatDate(booking.visited_date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Passengers:</Text>
            <Text style={styles.value}>{booking.total_passengers}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{booking.payment_method}</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{booking.currency} {parseFloat(booking.total_price_selling).toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>{formatDateTime(booking.created_at)}</Text>
          </View>
        </View>

        {agent_info && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agent Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Agent Name:</Text>
              <Text style={styles.value}>{agent_info.agent_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Serial No:</Text>
              <Text style={styles.value}>{agent_info.sl_no}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{agent_info.email}</Text>
            </View>
            {agent_info.contact_number && (
              <View style={styles.row}>
                <Text style={styles.label}>Contact:</Text>
                <Text style={styles.value}>{agent_info.contact_number}</Text>
              </View>
            )}
            {agent_info.agent_address && (
              <View style={styles.row}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{agent_info.agent_address}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passenger Information</Text>
          {passengers.map((p, index) => (
            <View key={p.id} style={styles.passengerCard}>
              <View style={styles.passengerHeader}>
                <Text style={styles.passengerName}>
                  {p.full_name}
                </Text>
                {p.is_lead_passenger && (
                  <Text style={styles.leadBadge}>LEAD</Text>
                )}
              </View>
              <View style={styles.passengerDetails}>
                <View style={styles.row}>
                  <Text style={styles.label}>Gender:</Text>
                  <Text style={styles.value}>{p.gender}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Date of Birth:</Text>
                  <Text style={styles.value}>{formatDate(p.date_of_birth)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{p.email}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text style={styles.value}>{p.phone}</Text>
                </View>
                {p.ticket_number && (
                  <>
                    <View style={styles.row}>
                      <Text style={styles.label}>Ticket Number:</Text>
                      <Text style={styles.value}>{p.ticket_number}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Ticket Status:</Text>
                      <Text style={[styles.value, { color: p.ticket_status === 'ISSUED' ? '#10b981' : '#f59e0b' }]}>
                        {p.ticket_status}
                      </Text>
                    </View>
                    {p.ticket_format && (
                      <View style={styles.row}>
                        <Text style={styles.label}>Ticket Format:</Text>
                        <Text style={styles.value}>{p.ticket_format}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          ))}
        </View>

        {attraction_info && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attraction Information</Text>
            
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Product Details</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Product:</Text>
                <Text style={styles.value}>{attraction_info.ProductName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Package:</Text>
                <Text style={styles.value}>{attraction_info.PackageName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Category:</Text>
                <Text style={styles.value}>{attraction_info.Category}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Visit Date:</Text>
                <Text style={styles.value}>{attraction_info.VisitedDate}</Text>
              </View>
              {attraction_info.Duration > 0 && (
                <View style={styles.row}>
                  <Text style={styles.label}>Duration:</Text>
                  <Text style={styles.value}>{attraction_info.Duration} hours</Text>
                </View>
              )}
            </View>

            {attraction_info.Inclusions && attraction_info.Inclusions.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Inclusions</Text>
                {attraction_info.Inclusions.map((inc: string, idx: number) => (
                  <Text key={idx} style={styles.bulletPoint}>• {inc}</Text>
                ))}
              </View>
            )}

            {attraction_info.HowToUse && attraction_info.HowToUse.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>How To Use</Text>
                {attraction_info.HowToUse.map((how: string, idx: number) => (
                  <Text key={idx} style={styles.bulletPoint}>• {how}</Text>
                ))}
              </View>
            )}

            {attraction_info.CancleablePolicy && attraction_info.CancleablePolicy.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Cancellation Policy</Text>
                {attraction_info.CancleablePolicy.map((pol: string, idx: number) => (
                  <Text key={idx} style={styles.bulletPoint}>• {pol}</Text>
                ))}
              </View>
            )}

            {attraction_info.TermsAndConditions && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Terms & Conditions</Text>
                <Text style={styles.termsText}>{attraction_info.TermsAndConditions}</Text>
              </View>
            )}
          </View>
        )}

        {fare_details && fare_details.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fare Breakdown</Text>
            {fare_details.map((fare, idx) => (
              <View key={idx} style={styles.fareCard}>
                <View style={styles.row}>
                  <Text style={styles.label}>Passenger Type:</Text>
                  <Text style={styles.value}>{fare.Type}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Count:</Text>
                  <Text style={styles.value}>{fare.Count}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Base Price:</Text>
                  <Text style={styles.value}>{booking.currency} {fare.BasePrice.toLocaleString()}</Text>
                </View>
                {fare.Taxes > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Taxes:</Text>
                    <Text style={styles.value}>{booking.currency} {fare.Taxes.toLocaleString()}</Text>
                  </View>
                )}
                {fare.DiscountPrice > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Discount:</Text>
                    <Text style={styles.value}>-{booking.currency} {fare.DiscountPrice.toLocaleString()}</Text>
                  </View>
                )}
                <View style={[styles.row, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>{booking.currency} {fare.TotalPrice.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  container: {
    padding: 0,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1e40af',
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
    backgroundColor: '#fff',
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
    color: '#1e40af',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  passengerCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  passengerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  passengerName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#374151',
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
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#ef4444',
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
    color: '#374151',
  },
  bulletPoint: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 4,
    lineHeight: 18,
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    textAlign: 'justify',
  },
  fareCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: 'bold',
    flex: 1,
  },
  totalValue: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
});
