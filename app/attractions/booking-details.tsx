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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Info</Text>
          <View style={styles.row}><Text style={styles.label}>Booking ID:</Text><Text style={styles.value}>{booking.booking_trans_id}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Status:</Text><Text style={styles.value}>{booking.status}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Product:</Text><Text style={styles.value}>{booking.product_name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Package:</Text><Text style={styles.value}>{booking.package_name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Category:</Text><Text style={styles.value}>{booking.category}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Visit Date:</Text><Text style={styles.value}>{formatDate(booking.visited_date)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Agent:</Text><Text style={styles.value}>{agent_info?.agent_name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Amount:</Text><Text style={styles.value}>{booking.currency} {parseFloat(booking.total_price_selling).toFixed(2)}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passengers</Text>
          {passengers.map((p) => (
            <View key={p.id} style={styles.passengerCard}>
              <Text style={styles.passengerName}>{p.full_name} {p.is_lead_passenger ? '(Lead)' : ''}</Text>
              <Text style={styles.passengerInfo}>Gender: {p.gender} | DOB: {formatDate(p.date_of_birth)}</Text>
              <Text style={styles.passengerInfo}>Email: {p.email} | Phone: {p.phone}</Text>
              <Text style={styles.passengerInfo}>Ticket: {p.ticket_number} | Status: {p.ticket_status}</Text>
            </View>
          ))}
        </View>

        {attraction_info && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attraction Info</Text>
            <Text style={styles.label}>Inclusions:</Text>
            {attraction_info.Inclusions?.map((inc: string, idx: number) => (
              <Text key={idx} style={styles.value}>- {inc}</Text>
            ))}
            <Text style={styles.label}>How To Use:</Text>
            {attraction_info.HowToUse?.map((how: string, idx: number) => (
              <Text key={idx} style={styles.value}>- {how}</Text>
            ))}
            <Text style={styles.label}>Terms & Conditions:</Text>
            <Text style={styles.value}>{attraction_info.TermsAndConditions}</Text>
            <Text style={styles.label}>Cancellation Policy:</Text>
            {attraction_info.CancleablePolicy?.map((pol: string, idx: number) => (
              <Text key={idx} style={styles.value}>- {pol}</Text>
            ))}
          </View>
        )}

        {fare_details && fare_details.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fare Details</Text>
            {fare_details.map((fare, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.label}>{fare.Type}:</Text>
                <Text style={styles.value}>{booking.currency} {fare.TotalPrice}</Text>
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
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  passengerName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  passengerInfo: {
    fontSize: 12,
    color: '#555',
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
});
