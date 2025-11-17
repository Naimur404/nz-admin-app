import { Skeleton, SkeletonProfile } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/use-theme';
import { authService } from '@/services/auth';
import { profileService } from '@/services/profile';
import { UserProfile } from '@/types/profile';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Starting profile fetch...');
      const response = await profileService.getUserProfile();
      console.log('Profile API Response:', JSON.stringify(response, null, 2));
      console.log('Profile data:', response.data || response);
      
      // Check if response has the expected structure
      if (response && response.data) {
        setProfile(response.data);
      } else if (response) {
        // If response doesn't have .data property, use response directly
        setProfile(response as any);
      } else {
        console.error('No response data received');
        setError('No profile data received from server');
      }
    } catch (err: any) {
      console.error('Profile load error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(err.response?.data?.message || err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear token first to prevent any API calls
              await authService.logout();
              
              // Refresh global auth state
              if ((global as any).refreshAuth) {
                await (global as any).refreshAuth();
              }
              
              // Navigate to login screen immediately
              router.replace('/auth/login' as any);
            } catch (error) {
              console.error('Logout error:', error);
              // Even if logout fails, still redirect to login
              router.replace('/auth/login' as any);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
        <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerButton} />
        </View>
        <ScrollView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
          <SkeletonProfile />
          <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <View style={[styles.infoRow, { borderBottomColor: isDark ? '#374151' : '#f3f4f6' }]}>
              <Skeleton width={20} height={20} borderRadius={10} />
              <View style={styles.infoContent}>
                <Skeleton width="30%" height={14} style={{ marginBottom: 4 }} />
                <Skeleton width="60%" height={16} />
              </View>
            </View>
            <View style={[styles.infoRow, { borderBottomColor: isDark ? '#374151' : '#f3f4f6' }]}>
              <Skeleton width={20} height={20} borderRadius={10} />
              <View style={styles.infoContent}>
                <Skeleton width="40%" height={14} style={{ marginBottom: 4 }} />
                <Skeleton width="70%" height={16} />
              </View>
            </View>
            <View style={[styles.logoutRow, { borderTopColor: isDark ? '#374151' : '#f3f4f6' }]}>
              <Skeleton width={20} height={20} borderRadius={10} />
              <Skeleton width="30%" height={16} style={{ marginLeft: 12 }} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
        <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
          <Text style={[styles.errorText, { color: isDark ? '#f87171' : '#ef4444' }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: isDark ? '#3b82f6' : '#1e40af' }]} onPress={loadProfile}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
        <View style={[styles.profileCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
          <View style={styles.avatarContainer}>
            {profile?.avatar ? (
              <View style={[styles.avatar, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
                {/* Avatar image would go here */}
                <Ionicons name="person" size={40} color={isDark ? '#9ca3af' : '#666'} />
              </View>
            ) : (
              <View style={[styles.avatar, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
                <Ionicons name="person" size={40} color={isDark ? '#9ca3af' : '#666'} />
              </View>
            )}
          </View>

          <Text style={[styles.name, { color: isDark ? '#f3f4f6' : '#333' }]}>{profile?.name || 'No Name'}</Text>
          <Text style={[styles.userType, { 
            color: isDark ? '#60a5fa' : '#1e40af', 
            backgroundColor: isDark ? '#1e3a8a' : '#dbeafe' 
          }]}>{profile?.user_type?.toUpperCase() || 'USER'}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
          <View style={[styles.infoRow, { borderBottomColor: isDark ? '#374151' : '#f3f4f6' }]}>
            <Ionicons name="mail-outline" size={20} color={isDark ? '#9ca3af' : '#666'} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#666' }]}>Email</Text>
              <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#333' }]}>{profile?.email || 'Not provided'}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: isDark ? '#374151' : '#f3f4f6' }]}>
            <Ionicons name="call-outline" size={20} color={isDark ? '#9ca3af' : '#666'} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: isDark ? '#9ca3af' : '#666' }]}>Contact</Text>
              <Text style={[styles.infoValue, { color: isDark ? '#f3f4f6' : '#333' }]}>{profile?.contact || 'Not provided'}</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.logoutRow, { borderTopColor: isDark ? '#374151' : '#f3f4f6' }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerButton: {
    padding: 4,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 12,
    borderTopWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
});