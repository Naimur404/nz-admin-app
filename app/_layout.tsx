import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '@/hooks/use-theme';
import { setAuthRedirectCallback } from '@/services/api';
import { authService } from '@/services/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

function useProtectedRoute(isAuthenticated: boolean, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if already authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth redirect callback for API interceptor
    setAuthRedirectCallback(() => {
      setIsAuthenticated(false);
      router.replace('/auth/login' as any);
    });
    
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await authService.getToken();
      const newAuthState = !!token;
      setIsAuthenticated(newAuthState);
      console.log('Auth check - Token exists:', newAuthState);
    } catch (error) {
      console.log('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-check auth when app comes to foreground or after login
  useEffect(() => {
    const interval = setInterval(checkAuth, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useProtectedRoute(isAuthenticated, isLoading);

  if (isLoading) {
    return null; // or a loading screen
  }

  return (
    <ThemeProvider>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
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
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
