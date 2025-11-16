import { profileService } from '@/services/profile';
import { ticketSupportService } from '@/services/ticket-support';
import { UserProfile } from '@/types/profile';
import { DataCountResponse } from '@/types/ticket-support';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ticketDataCount, setTicketDataCount] = useState<DataCountResponse | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-screenWidth * 0.8))[0];

  const isDark = theme === 'dark';

  useEffect(() => {
    loadProfile();
    loadTicketDataCount();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileService.getUserProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadTicketDataCount = async () => {
    try {
      const response = await ticketSupportService.getDataCount();
      setTicketDataCount(response);
    } catch (error) {
      console.error('Error loading ticket data count:', error);
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

  const handleMenuPress = (route: string) => {
    console.log('Menu item clicked:', route);
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
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.welcomeSection, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
          <Text style={[styles.welcomeText, { color: isDark ? '#f3f4f6' : '#333' }]}>Welcome back!</Text>
          <Text style={[styles.welcomeSubtext, { color: isDark ? '#9ca3af' : '#666' }]}>{profile?.name}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="bus" size={24} color="#1e40af" />
            </View>
            <Text style={styles.statNumber}>150</Text>
            <Text style={styles.statLabel}>Bus Bookings</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="camera" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.statNumber}>89</Text>
            <Text style={styles.statLabel}>Attractions</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="bed" size={24} color="#10b981" />
            </View>
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Hotels</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="airplane" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statNumber}>120</Text>
            <Text style={styles.statLabel}>Flights</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/bus/bookings' as any)}
            >
              <Ionicons name="bus" size={32} color="#1e40af" />
              <Text style={styles.actionTitle}>Bus Bookings</Text>
              <Text style={styles.actionSubtitle}>Manage bus reservations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/attractions/bookings' as any)}
            >
              <Ionicons name="camera" size={32} color="#8b5cf6" />
              <Text style={styles.actionTitle}>Attractions</Text>
              <Text style={styles.actionSubtitle}>View attraction bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/hotel/bookings' as any)}
            >
              <Ionicons name="bed" size={32} color="#10b981" />
              <Text style={styles.actionTitle}>Hotels</Text>
              <Text style={styles.actionSubtitle}>Manage hotel bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="bar-chart" size={32} color="#ef4444" />
              <Text style={styles.actionTitle}>Reports</Text>
              <Text style={styles.actionSubtitle}>View analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/flight/bookings' as any)}
            >
              <Ionicons name="airplane" size={32} color="#f59e0b" />
              <Text style={styles.actionTitle}>Flights</Text>
              <Text style={styles.actionSubtitle}>Manage flight bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/ticket-support' as any)}
            >
              <Ionicons name="headset" size={32} color="#8b5cf6" />
              <View style={styles.actionTitleContainer}>
                <Text style={styles.actionTitle}>Ticket Support</Text>
                {ticketDataCount && (
                  <Text style={styles.actionBadge}>({ticketDataCount.ticket_in_process})</Text>
                )}
              </View>
              <Text style={styles.actionSubtitle}>Air ticket assistance</Text>
            </TouchableOpacity>
          </View>
        </View>
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
          <Animated.View style={[styles.sidebarContainer, { transform: [{ translateX: slideAnim }] }]}>
            <Pressable style={styles.sidebarContent} onPress={() => {}}>
              <View style={styles.drawerHeader}>
                <View style={styles.profileSection}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color="#fff" />
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
                    <Text style={styles.profileEmail}>{profile?.email || 'No email'}</Text>
                    <Text style={styles.profileType}>{profile?.user_type?.toUpperCase() || 'USER'}</Text>
                  </View>
                </View>
              </View>

              <ScrollView style={styles.drawerContent}>
                <View style={styles.menuSection}>
                  <Text style={styles.menuSectionTitle}>MAIN MENU</Text>
                  {menuItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => handleMenuPress(item.route)}
                    >
                      <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                        <Ionicons name={item.icon as any} size={20} color="#fff" />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuText}>{item.title}</Text>
                        {item.route === '/ticket-support' && ticketDataCount && (
                          <Text style={styles.menuBadge}>({ticketDataCount.ticket_in_process})</Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.menuSection}>
                  <Text style={styles.menuSectionTitle}>ACCOUNT</Text>
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
                    <Text style={styles.menuText}>Profile</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
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
});
