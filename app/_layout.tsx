import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '@/hooks/use-theme';
import { setAuthRedirectCallback } from '@/services/api';
import { authService } from '@/services/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

function useProtectedRoute(isAuthenticated: boolean | null, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading || isAuthenticated === null) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if already authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, router]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  // Use null as initial state to distinguish from false (not authenticated)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth redirect callback for API interceptor
    setAuthRedirectCallback(() => {
      setIsAuthenticated(false);
      router.replace('/auth/login' as any);
    });
    
    // Check auth immediately on app start
    checkAuth();
  }, [router]);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Start auth check and minimum loading time in parallel
      const [authResult] = await Promise.all([
        (async () => {
          const token = await authService.getToken();
          const user = await authService.getUser();
          return { token, user };
        })(),
        new Promise(resolve => setTimeout(resolve, 2000)) // Minimum 2 seconds loading
      ]);
      
      // Only consider authenticated if both token and user exist
      const newAuthState = !!(authResult.token && authResult.user);
      setIsAuthenticated(newAuthState);
      console.log('Auth check - Token exists:', !!authResult.token, 'User exists:', !!authResult.user, 'Authenticated:', newAuthState);
    } catch (error) {
      console.log('Auth check error:', error);
      setIsAuthenticated(false);
      // Still wait minimum time even on error for consistent UX
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsLoading(false);
    }
  };

  // Re-check auth when app comes to foreground (disabled automatic interval)
  // Removed automatic auth checks that were causing unwanted refreshes
  // Auth will only be checked on app start, manual refresh, or login/logout

  // Expose checkAuth function globally for login success
  useEffect(() => {
    (global as any).refreshAuth = checkAuth;
    return () => {
      delete (global as any).refreshAuth;
    };
  }, []);

  useProtectedRoute(isAuthenticated, isLoading);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" backgroundColor="#1e40af" />
        
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/mynztrip-white.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        
        {/* App Title */}
        <Text style={styles.appTitle}>Admin</Text>
        <Text style={styles.appSubtitle}>Travel Management System</Text>
        
        {/* Loading Indicator */}
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        
        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName={isAuthenticated ? "(tabs)" : "auth/login"}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false, title: 'Login' }} />
          <Stack.Screen name="profile" options={{ headerShown: false, title: 'Profile' }} />
          <Stack.Screen name="bus/bookings" options={{ headerShown: false, title: 'Bus Bookings' }} />
          <Stack.Screen name="bus/booking-details" options={{ headerShown: false, title: 'Booking Details' }} />
          <Stack.Screen name="attractions/bookings" options={{ headerShown: false, title: 'Attraction Bookings' }} />
          <Stack.Screen name="attractions/booking-details" options={{ headerShown: false, title: 'Attraction Booking Details' }} />
          <Stack.Screen name="hotel/bookings" options={{ headerShown: false, title: 'Hotel Bookings' }} />
          <Stack.Screen name="hotel/booking-details" options={{ headerShown: false, title: 'Hotel Booking Details' }} />
          <Stack.Screen name="flight/bookings" options={{ headerShown: false, title: 'Flight Bookings' }} />
          <Stack.Screen name="flight/office-bookings" options={{ headerShown: false, title: 'Office Flight Bookings' }} />
          <Stack.Screen name="flight/agent-bookings" options={{ headerShown: false, title: 'Agent Flight Bookings' }} />
          <Stack.Screen name="flight/booking-details" options={{ headerShown: false, title: 'Flight Booking Details' }} />
          <Stack.Screen name="ticket-support" options={{ headerShown: false, title: 'Air Ticket Support' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e40af',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 48,
    textAlign: 'center',
  },
  loadingIndicator: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  versionText: {
    position: 'absolute',
    bottom: 48,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
});
