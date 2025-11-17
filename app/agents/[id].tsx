import { SkeletonList } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/use-theme';
import { agentService } from '@/services/agent';
import { AgentDetails, AgentDocument } from '@/types/agent';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AgentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [agentData, setAgentData] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [otpStatus, setOtpStatus] = useState(0);
  const [isVendorAllowed, setIsVendorAllowed] = useState(0);

  useEffect(() => {
    if (id) {
      fetchAgentDetails();
    }
  }, [id]);

  const fetchAgentDetails = async () => {
    try {
      setLoading(true);
      const response = await agentService.getAgentDetails(id as string);
      setAgentData(response.data);
      setOtpStatus(response.otp_status);
      setIsVendorAllowed(response.is_vendor_allowed);
    } catch (error) {
      console.error('Error fetching agent details:', error);
      Alert.alert('Error', 'Failed to fetch agent details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAgentDetails();
    setRefreshing(false);
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return '#10b981'; // Approved - green
      case 0: return '#f59e0b'; // Pending - yellow
      case -1: return '#ef4444'; // Rejected - red
      default: return '#6b7280'; // Unknown - gray
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Approved';
      case 0: return 'Pending';
      case -1: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getAgentCategoryText = (category: number) => {
    switch (category) {
      case 1: return 'IATA';
      case 2: return 'Non-IATA';
      case 3: return 'Freelancer';
      default: return 'Unknown';
    }
  };

  const getAgentTypeText = (type: number) => {
    switch (type) {
      case 1: return 'In House';
      case 2: return 'B2B Agent';
      case 3: return 'API User';
      default: return 'Unknown';
    }
  };

  const getActivityStatusText = (activity: number) => {
    return activity === 1 ? 'Active' : 'Inactive';
  };

  const getActivityStatusColor = (activity: number) => {
    return activity === 1 ? '#10b981' : '#ef4444';
  };

  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    return `${currency} ${numAmount.toFixed(2)}`;
  };

  const handleDocumentPress = async (doc: AgentDocument) => {
    if (doc.file.startsWith('http')) {
      try {
        await Linking.openURL(doc.file);
      } catch (error) {
        Alert.alert('Error', 'Unable to open document');
      }
    } else {
      Alert.alert('Document', `Document content: ${doc.file}`);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
          <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={isDark ? '#1f2937' : '#1e40af'} />
            <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Agent Details</Text>
              <View style={styles.headerButton} />
            </View>
          </SafeAreaView>
          <ScrollView style={styles.content}>
            <SkeletonList itemCount={8} />
          </ScrollView>
        </View>
      </>
    );
  }

  if (!agentData) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
          <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={isDark ? '#1f2937' : '#1e40af'} />
            <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Agent Details</Text>
              <View style={styles.headerButton} />
            </View>
          </SafeAreaView>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color={isDark ? '#4b5563' : '#9ca3af'} />
            <Text style={[styles.errorTitle, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
              Agent not found
            </Text>
            <Text style={[styles.errorSubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              The requested agent details could not be loaded.
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]} edges={['top']}>
          <StatusBar barStyle="light-content" backgroundColor={isDark ? '#1f2937' : '#1e40af'} />
          <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Agent Details</Text>
            <View style={styles.headerButton} />
          </View>
        </SafeAreaView>

        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[isDark ? '#3b82f6' : '#1e40af']}
              tintColor={isDark ? '#3b82f6' : '#1e40af'}
            />
          }
        >
          {/* Basic Information */}
          <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color={isDark ? '#3b82f6' : '#1e40af'} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                Basic Information
              </Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>SL No.</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.sl_no}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Company Name</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.company_name}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Contact Person</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.contact_person}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Email</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.email}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Contact Number</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.contact_number}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Join Date</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.join_date}</Text>
              </View>
            </View>
          </View>

          {/* Status Information */}
          <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={20} color={isDark ? '#3b82f6' : '#1e40af'} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                Status Information
              </Text>
            </View>

            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(agentData.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(agentData.status)}</Text>
                </View>
              </View>

              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Activity</Text>
                <View style={[styles.statusBadge, { backgroundColor: getActivityStatusColor(agentData.activity) }]}>
                  <Text style={styles.statusText}>{getActivityStatusText(agentData.activity)}</Text>
                </View>
              </View>

              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Category</Text>
                <Text style={[styles.statusValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                  {getAgentCategoryText(agentData.agent_category)}
                </Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Type</Text>
                <Text style={[styles.statusValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                  {getAgentTypeText(agentData.agent_type)}
                </Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Verified</Text>
                <Text style={[styles.statusValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                  {agentData.is_validated ? 'Verified' : 'Pending'}
                </Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>OTP Status</Text>
                <Text style={[styles.statusValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                  {otpStatus ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>

          {/* Address Information */}
          <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color={isDark ? '#3b82f6' : '#1e40af'} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                Address Information
              </Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={[styles.infoItem, styles.fullWidth]}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Address</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.address}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Zip Code</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.zip_code}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Office Number</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.office_number}</Text>
              </View>
            </View>
          </View>

          {/* Financial Information */}
          <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="wallet-outline" size={20} color={isDark ? '#3b82f6' : '#1e40af'} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                Financial Information
              </Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Balance</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#34d399' : '#059669' }]}>
                  {formatCurrency(agentData.balance, agentData.currency)}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Loan Balance</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f87171' : '#dc2626' }]}>
                  {formatCurrency(agentData.loan_balance, agentData.currency)}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Credit Limit</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                  {formatCurrency(agentData.credit_limit, agentData.currency)}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Currency</Text>
                <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.currency}</Text>
              </View>
            </View>
          </View>

          {/* Partner Information */}
          {agentData.partner && (
            <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="business-outline" size={20} color={isDark ? '#3b82f6' : '#1e40af'} />
                <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                  Partner Information
                </Text>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Partner Code</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.partner.partner_code}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Company</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.partner.company_name}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Director</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.partner.director_name}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.partner.office_email}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Phone</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.partner.director_phone_number}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Commission</Text>
                  <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>{agentData.partner.partner_commision}%</Text>
                </View>
              </View>
            </View>
          )}

          {/* Documents */}
          {agentData.agent_documents && agentData.agent_documents.length > 0 && (
            <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-outline" size={20} color={isDark ? '#3b82f6' : '#1e40af'} />
                <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                  Documents
                </Text>
              </View>

              {agentData.agent_documents.map((doc, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.documentItem, { borderColor: isDark ? '#374151' : '#e5e7eb' }]}
                  onPress={() => handleDocumentPress(doc)}
                >
                  <View style={styles.documentInfo}>
                    <Text style={[styles.documentName, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                      {doc.name}
                    </Text>
                    <View style={styles.documentMeta}>
                      <View style={[
                        styles.validationBadge,
                        { backgroundColor: doc.is_validated ? '#10b981' : '#f59e0b' }
                      ]}>
                        <Text style={styles.validationText}>
                          {doc.is_validated ? 'Validated' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Markets */}
          {agentData.available_markets && agentData.available_markets.length > 0 && (
            <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="globe-outline" size={20} color={isDark ? '#3b82f6' : '#1e40af'} />
                <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                  Available Markets
                </Text>
              </View>

              {agentData.available_markets.map((market, index) => (
                <View key={index} style={[styles.marketItem, { borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
                  <View style={styles.marketInfo}>
                    <Text style={[styles.marketName, { color: isDark ? '#f3f4f6' : '#1f2937' }]}>
                      {market.market_name}
                    </Text>
                    <Text style={[styles.marketCurrency, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                      {market.currency}
                    </Text>
                  </View>
                  <View style={styles.marketBadges}>
                    {market.is_active === 1 && (
                      <View style={[styles.marketBadge, { backgroundColor: '#10b981' }]}>
                        <Text style={styles.marketBadgeText}>Active</Text>
                      </View>
                    )}
                    {market.is_default === 1 && (
                      <View style={[styles.marketBadge, { backgroundColor: '#3b82f6' }]}>
                        <Text style={styles.marketBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </>
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
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e40af',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  fullWidth: {
    width: '100%',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '400',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statusItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '400',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  validationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  marketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  marketInfo: {
    flex: 1,
  },
  marketName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  marketCurrency: {
    fontSize: 14,
    color: '#6b7280',
  },
  marketBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  marketBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  marketBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});