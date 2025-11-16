import { Ionicons } from '@expo/vector-icons';
import { DrawerLayoutAndroid } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileService } from '@/services/profile';
import { UserProfile } from '@/types/profile';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const drawer = useRef<DrawerLayoutAndroid>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileService.getUserProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
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
    drawer.current?.closeDrawer();
    if (route === '/bus/bookings' || route === '/attractions/bookings') {
      router.push(route as any);
    } else {
      // For not yet implemented routes
      console.log('Navigating to:', route);
    }
  };

  const openDrawer = () => {
    drawer.current?.openDrawer();
  };

  const navigationView = () => (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name || 'Loading...'}</Text>
            <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
            <Text style={styles.profileType}>{profile?.user_type?.toUpperCase() || ''}</Text>
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
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>ACCOUNT</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              drawer.current?.closeDrawer();
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
    </View>
  );

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={screenWidth * 0.75}
      drawerPosition={'left'}
      renderNavigationView={navigationView}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NZ Admin</Text>
          <TouchableOpacity
            onPress={() => router.push('/profile' as any)}
            style={styles.profileButton}
          >
            <Ionicons name="person-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.welcomeSubtext}>{profile?.name}</Text>
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

              <TouchableOpacity style={styles.actionCard}>
                <Ionicons name="bar-chart" size={32} color="#ef4444" />
                <Text style={styles.actionTitle}>Reports</Text>
                <Text style={styles.actionSubtitle}>View analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <Ionicons name="people" size={32} color="#06b6d4" />
                <Text style={styles.actionTitle}>Agents</Text>
                <Text style={styles.actionSubtitle}>Manage agents</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </DrawerLayoutAndroid>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
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
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
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
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
