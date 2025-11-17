import { Skeleton, SkeletonStats } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/use-theme';
import { profileService } from '@/services/profile';
import { ticketSupportService } from '@/services/ticket-support';
import { UserProfile } from '@/types/profile';
import { DataCountResponse } from '@/types/ticket-support';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ticketDataCount, setTicketDataCount] = useState<DataCountResponse | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-screenWidth * 0.8))[0];
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const isDark = theme === 'dark';

  // Function to format display name
  const getDisplayName = (profile: UserProfile | null): string => {
    if (!profile) return 'User';
    
    // If name exists, format it nicely
    if (profile.name) {
      // Convert "IT DEPARTMENT" to "It Department"
      return profile.name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    // Fallback to email prefix if no name
    if (profile.email) {
      const emailPrefix = profile.email.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    
    // Final fallback
    return 'User';
  };

  useEffect(() => {
    // Only load data once on mount
    if (!hasInitialized.current) {
      checkAuthAndLoadData();
      hasInitialized.current = true;
    }
  }, []); // Empty dependency array - only run once on mount

  const checkAuthAndLoadData = async () => {
    try {
      setLoading(true);
      // Check if we have a valid token first
      const token = await require('@/services/auth').authService.getToken();
      if (!token) {
        console.log('No token found, skipping data load');
        setLoading(false);
        setProfileLoading(false);
        setStatsLoading(false);
        return;
      }
      
      // Only load data if we have a token
      loadProfile();
      loadTicketDataCount();
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
      setProfileLoading(false);
      setStatsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Check if we have a valid token
      const token = await require('@/services/auth').authService.getToken();
      if (!token) {
        console.log('No token found, skipping refresh');
        return;
      }
      
      // Reset loading states to show skeletons
      setProfileLoading(true);
      setStatsLoading(true);
      setLoading(true);
      
      // Reload data
      await Promise.all([
        loadProfile(),
        loadTicketDataCount()
      ]);
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const loadProfile = async (): Promise<void> => {
    try {
      setProfileLoading(true);
      // Check token before making API call
      const token = await require('@/services/auth').authService.getToken();
      if (!token) {
        console.log('No token available, skipping profile load');
        return;
      }
      
      const profileData = await profileService.getUserProfile();
      
      // The profile service already returns the data we need
      if (profileData) {
        setProfile(profileData as any);
      } else {
        console.log('No profile data received');
        setProfile(null);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      
      // Check if it's a 401 error (authentication failed)
      if (error.response?.status === 401) {
        console.log('Authentication failed, token may be expired');
        // Clear profile data but don't try to redirect from here
        setProfile(null);
        return;
      }
      
      // For other errors, you might want to show a user-friendly message
      // or attempt a retry logic here
    } finally {
      setProfileLoading(false);
    }
  };

  const loadTicketDataCount = async (): Promise<void> => {
    try {
      setStatsLoading(true);
      // Check token before making API call
      const token = await require('@/services/auth').authService.getToken();
      if (!token) {
        console.log('No token available, skipping ticket data count load');
        return;
      }
      
      const response = await ticketSupportService.getDataCount();
      setTicketDataCount(response);
    } catch (error: any) {
      console.error('Error loading ticket data count:', error);
      
      // Check if it's a 401 error (authentication failed)
      if (error.response?.status === 401) {
        console.log('Authentication failed for ticket data, token may be expired');
        // Clear ticket data but don't try to redirect from here
        setTicketDataCount(null);
        return;
      }
    } finally {
      setStatsLoading(false);
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'Bus Bookings',
      icon: 'bus-outline',
      route: '/bus/bookings',
      color: '#1e40af',
    },
    {
      title: 'Attraction Bookings',
      icon: 'camera-outline',
      route: '/attractions/bookings',
      color: '#8b5cf6',
    },
    {
      title: 'Hotel Bookings',
      icon: 'bed-outline',
      route: '/hotel/bookings',
      color: '#10b981',
    },
    {
      title: 'Flight Bookings',
      icon: 'airplane-outline',
      route: '/flight/bookings',
      color: '#f59e0b',
    },
    {
      title: 'Air Ticket Support',
      icon: 'headset-outline',
      route: '/ticket-support',
      color: '#8b5cf6',
    },
    {
      title: 'Reports',
      icon: 'bar-chart-outline',
      route: '/reports',
      color: '#ef4444',
      hasSubmenu: true,
      submenuItems: [
        {
          title: 'Air Ticket Sales Report',
          route: '/reports/air-ticket-sales',
          icon: 'airplane-outline',
        },
        {
          title: 'Agent Account Statement',
          route: '/reports/agent-account-statement',
          icon: 'person-outline',
        },
      ],
    },
    {
      title: 'Agents',
      icon: 'people-outline',
      route: '/agents',
      color: '#06b6d4',
    },
    {
      title: 'Settings',
      icon: 'settings-outline',
      route: '/settings',
      color: '#6b7280',
    },
  ];

  const handleMenuPress = (route: string, hasSubmenu?: boolean) => {
    console.log('Menu item clicked:', route);
    
    // If the menu item has a submenu, toggle expansion instead of navigating
    if (hasSubmenu) {
      setExpandedSubmenu(expandedSubmenu === route ? null : route);
      return;
    }
    
    closeSidebar();
    
    // Use a timeout to ensure sidebar closes before navigation
    setTimeout(() => {
      try {
        if (route === '/bus/bookings') {
          console.log('Navigating to bus bookings');
          router.navigate('/bus/bookings');
        } else if (route === '/attractions/bookings') {
          console.log('Navigating to attractions bookings');
          router.navigate('/attractions/bookings');
        } else if (route === '/hotel/bookings') {
          console.log('Navigating to hotel bookings');
          router.navigate('/hotel/bookings');
        } else if (route === '/flight/bookings') {
          console.log('Navigating to flight bookings');
          router.navigate('/flight/bookings');
        } else if (route === '/ticket-support') {
          console.log('Navigating to ticket support');
          router.navigate('/ticket-support');
        } else if (route === '/agents') {
          console.log('Navigating to agents');
          router.navigate('/agents');
        } else {
          // For not yet implemented routes
          console.log('Route not implemented yet:', route);
          alert('This feature is coming soon!');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        alert('Navigation failed. Please try again.');
      }
    }, 300);
  };

  const handleSubmenuPress = (route: string) => {
    console.log('Submenu item clicked:', route);
    closeSidebar();
    
    // Use a timeout to ensure sidebar closes before navigation
    setTimeout(() => {
      try {
        if (route === '/reports/air-ticket-sales') {
          console.log('Navigating to air ticket sales report');
          router.navigate('/reports/air-ticket-sales');
        } else if (route === '/reports/agent-account-statement') {
          console.log('Navigating to account statement');
          router.navigate('/reports/account-statement');
        } else {
          // For other not yet implemented routes
          console.log('Report route not implemented yet:', route);
          alert('This report feature is coming soon!');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        alert('Navigation failed. Please try again.');
      }
    }, 300);
  };

  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -screenWidth * 0.8,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setSidebarVisible(false);
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
        <TouchableOpacity onPress={openSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Image 
          source={require('@/assets/images/mynztrip-white.png')} 
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={() => router.push('/profile' as any)}
          style={styles.profileButton}
        >
          <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[isDark ? '#3b82f6' : '#2563eb']}
              tintColor={isDark ? '#3b82f6' : '#2563eb'}
            />
          }
        >
        
        {/* Welcome Section with Skeleton */}
        {(profileLoading || refreshing) ? (
          <View style={[styles.welcomeSection, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <Skeleton width="60%" height={24} style={{ marginBottom: 8 }} />
            <Skeleton width="40%" height={16} />
          </View>
        ) : (
          <View style={[styles.welcomeSection, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <Text style={[styles.welcomeText, { color: isDark ? '#f3f4f6' : '#333' }]}>
              Welcome back, {getDisplayName(profile)}!
            </Text>
            <Text style={[styles.welcomeSubtext, { color: isDark ? '#9ca3af' : '#666' }]}>
              {profile?.user_type || profile?.panel || 'User'}
            </Text>
          </View>
        )}

        {/* Stats Section with Skeleton */}
        {(statsLoading || refreshing) ? (
          <SkeletonStats columns={4} />
        ) : (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
              <View style={styles.statIcon}>
                <Ionicons name="bus" size={24} color="#1e40af" />
              </View>
              <Text style={[styles.statNumber, { color: isDark ? '#f3f4f6' : '#333' }]}>150</Text>
              <Text style={[styles.statLabel, { color: isDark ? '#9ca3af' : '#666' }]}>Bus Bookings</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
              <View style={styles.statIcon}>
                <Ionicons name="camera" size={24} color="#8b5cf6" />
              </View>
              <Text style={[styles.statNumber, { color: isDark ? '#f3f4f6' : '#333' }]}>89</Text>
              <Text style={[styles.statLabel, { color: isDark ? '#9ca3af' : '#666' }]}>Attractions</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
              <View style={styles.statIcon}>
                <Ionicons name="bed" size={24} color="#10b981" />
              </View>
              <Text style={[styles.statNumber, { color: isDark ? '#f3f4f6' : '#333' }]}>45</Text>
              <Text style={[styles.statLabel, { color: isDark ? '#9ca3af' : '#666' }]}>Hotels</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
              <View style={styles.statIcon}>
                <Ionicons name="airplane" size={24} color="#f59e0b" />
              </View>
              <Text style={[styles.statNumber, { color: isDark ? '#f3f4f6' : '#333' }]}>120</Text>
              <Text style={[styles.statLabel, { color: isDark ? '#9ca3af' : '#666' }]}>Flights</Text>
            </View>
          </View>
        )}

        {/* Quick Actions Section with Skeleton */}
        {(loading || refreshing) ? (
          <View style={styles.quickActions}>
            <Skeleton width="50%" height={20} style={{ marginBottom: 16, marginLeft: 16 }} />
            <View style={styles.actionGrid}>
              {Array.from({ length: 6 }).map((_, index) => (
                <View key={index} style={[styles.actionCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
                  <Skeleton width={32} height={32} borderRadius={16} style={{ marginBottom: 8 }} />
                  <Skeleton width="80%" height={16} style={{ marginBottom: 4 }} />
                  <Skeleton width="60%" height={12} />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.quickActions}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>Quick Actions</Text>
            
            <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}
              onPress={() => router.push('/bus/bookings' as any)}
            >
              <Ionicons name="bus" size={32} color="#1e40af" />
              <Text style={[styles.actionTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>Bus Bookings</Text>
              <Text style={[styles.actionSubtitle, { color: isDark ? '#9ca3af' : '#666' }]}>Manage bus reservations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}
              onPress={() => router.push('/attractions/bookings' as any)}
            >
              <Ionicons name="camera" size={32} color="#8b5cf6" />
              <Text style={[styles.actionTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>Attractions</Text>
              <Text style={[styles.actionSubtitle, { color: isDark ? '#9ca3af' : '#666' }]}>View attraction bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}
              onPress={() => router.push('/hotel/bookings' as any)}
            >
              <Ionicons name="bed" size={32} color="#10b981" />
              <Text style={[styles.actionTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>Hotels</Text>
              <Text style={[styles.actionSubtitle, { color: isDark ? '#9ca3af' : '#666' }]}>Manage hotel bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
              <Ionicons name="bar-chart" size={32} color="#ef4444" />
              <Text style={[styles.actionTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>Reports</Text>
              <Text style={[styles.actionSubtitle, { color: isDark ? '#9ca3af' : '#666' }]}>View analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}
              onPress={() => router.push('/flight/bookings' as any)}
            >
              <Ionicons name="airplane" size={32} color="#f59e0b" />
              <Text style={[styles.actionTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>Flights</Text>
              <Text style={[styles.actionSubtitle, { color: isDark ? '#9ca3af' : '#666' }]}>Manage flight bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}
              onPress={() => router.push('/ticket-support' as any)}
            >
              <Ionicons name="headset" size={32} color="#8b5cf6" />
              <View style={styles.actionTitleContainer}>
                <Text style={[styles.actionTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>Ticket Support</Text>
                {ticketDataCount && (
                  <Text style={styles.actionBadge}>({ticketDataCount.ticket_in_process})</Text>
                )}
              </View>
              <Text style={[styles.actionSubtitle, { color: isDark ? '#9ca3af' : '#666' }]}>Air ticket assistance</Text>
            </TouchableOpacity>
          </View>
          </View>
        )}
      </ScrollView>
      </View>

      {/* Sidebar Modal */}
      <Modal
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={closeSidebar}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.sidebarContainer, { backgroundColor: isDark ? '#1f2937' : '#fff', transform: [{ translateX: slideAnim }] }]}>
            <Pressable style={styles.sidebarContent} onPress={() => {}}>
              <View style={[styles.drawerHeader, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
                <View style={styles.profileSection}>
                  <View style={styles.avatar}>
                    {profile?.avatar ? (
                      <Image 
                        source={{ uri: profile.avatar }} 
                        style={styles.avatarImage}
                        onError={() => {
                          console.log('Failed to load avatar image');
                        }}
                      />
                    ) : (
                      <Ionicons name="person" size={24} color="#fff" />
                    )}
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{getDisplayName(profile)}</Text>
                    <Text style={styles.profileEmail}>{profile?.email || 'No email'}</Text>
                    <Text style={styles.profileType}>{profile?.user_type?.toUpperCase() || 'USER'}</Text>
                  </View>
                </View>
              </View>

              <ScrollView style={styles.drawerContent}>
                <View style={styles.menuSection}>
                  <Text style={[styles.menuSectionTitle, { color: isDark ? '#9ca3af' : '#666' }]}>MAIN MENU</Text>
                  {menuItems.map((item, index) => (
                    <View key={index}>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleMenuPress(item.route, item.hasSubmenu)}
                      >
                        <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                          <Ionicons name={item.icon as any} size={20} color="#fff" />
                        </View>
                        <View style={styles.menuTextContainer}>
                          <Text style={[styles.menuText, { color: isDark ? '#f3f4f6' : '#333' }]}>{item.title}</Text>
                          {item.route === '/ticket-support' && ticketDataCount && (
                            <Text style={styles.menuBadge}>({ticketDataCount.ticket_in_process})</Text>
                          )}
                        </View>
                        <Ionicons 
                          name={item.hasSubmenu ? (expandedSubmenu === item.route ? "chevron-down" : "chevron-forward") : "chevron-forward"} 
                          size={20} 
                          color={isDark ? '#9ca3af' : '#666'} 
                        />
                      </TouchableOpacity>
                      
                      {/* Render submenu items if this menu is expanded */}
                      {item.hasSubmenu && expandedSubmenu === item.route && item.submenuItems && (
                        <View style={styles.submenuContainer}>
                          {item.submenuItems.map((submenuItem, submenuIndex) => (
                            <TouchableOpacity
                              key={submenuIndex}
                              style={styles.submenuItem}
                              onPress={() => handleSubmenuPress(submenuItem.route)}
                            >
                              <View style={[styles.submenuIcon, { backgroundColor: item.color }]}>
                                <Ionicons name={submenuItem.icon as any} size={16} color="#fff" />
                              </View>
                              <Text style={[styles.submenuText, { color: isDark ? '#d1d5db' : '#555' }]}>
                                {submenuItem.title}
                              </Text>
                              <Ionicons name="chevron-forward" size={16} color={isDark ? '#9ca3af' : '#666'} />
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>

                <View style={styles.menuSection}>
                  <Text style={[styles.menuSectionTitle, { color: isDark ? '#9ca3af' : '#666' }]}>ACCOUNT</Text>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      closeSidebar();
                      router.push('/profile' as any);
                    }}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: '#3b82f6' }]}>
                      <Ionicons name="person-outline" size={20} color="#fff" />
                    </View>
                    <Text style={[styles.menuText, { color: isDark ? '#f3f4f6' : '#333' }]}>Profile</Text>
                    <Ionicons name="chevron-forward" size={20} color={isDark ? '#9ca3af' : '#666'} />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Pressable>
          </Animated.View>
          <Pressable style={styles.modalBackdrop} onPress={closeSidebar} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 0,
  },
  header: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    padding: 8,
  },
  headerLogo: {
    height: 35,
    width: 120,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    backgroundColor: '#1e40af',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 2,
  },
  profileType: {
    color: '#fff',
    fontSize: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  menuSection: {
    marginBottom: 30,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  menuBadge: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  welcomeSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: (screenWidth - 48) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    width: (screenWidth - 48) / 2,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actionBadge: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  sidebarContainer: {
    width: screenWidth * 0.8,
    backgroundColor: '#fff',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2,
  },
  sidebarContent: {
    flex: 1,
  },
  submenuContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingLeft: 20,
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  submenuIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  submenuText: {
    fontSize: 14,
    flex: 1,
  },
});
