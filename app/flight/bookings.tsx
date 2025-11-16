import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FlightBookingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flight Bookings</Text>
          <View style={styles.headerButton} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <Text style={styles.title}>Select Booking Type</Text>
        <Text style={styles.subtitle}>Choose the type of flight bookings you want to view</Text>

        <TouchableOpacity
          style={[styles.optionCard, styles.officeCard]}
          onPress={() => router.push('/flight/office-bookings')}
        >
          <View style={styles.optionIcon}>
            <Ionicons name="business" size={32} color="#fff" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Office Bookings</Text>
            <Text style={styles.optionDescription}>
              View and manage flight bookings from the office perspective
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionCard, styles.agentCard]}
          onPress={() => router.push('/flight/agent-bookings')}
        >
          <View style={styles.optionIcon}>
            <Ionicons name="people" size={32} color="#fff" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Agent Bookings</Text>
            <Text style={styles.optionDescription}>
              View and manage flight bookings from the agent perspective
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButton: {
    padding: 4,
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  officeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#1e40af',
  },
  agentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});