import * as SecureStore from 'expo-secure-store';

// Flag to track logout state - moved here to avoid circular dependency
let isLoggingOut = false;

// Auth redirect callback
let authRedirectCallback: (() => void) | null = null;

export const setAuthRedirectCallback = (callback: () => void) => {
  authRedirectCallback = callback;
};

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

export const getLoggingOut = (): boolean => {
  return isLoggingOut;
};

export const clearTokens = async (): Promise<void> => {
  try {
    setLoggingOut(true);
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('user_data');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

export const requestInterceptor = async (config: any) => {
  // Check if we're in the middle of logging out
  if (isLoggingOut) {
    console.log('Blocking API request during logout:', config.url);
    return Promise.reject(new Error('Request blocked during logout'));
  }
  
  const token = await SecureStore.getItemAsync('access_token');
  console.log('Request URL:', config.url);
  console.log('Token retrieved:', token ? 'Token exists' : 'No token found');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set');
  }
  
  return config;
};

export const responseInterceptor = {
  success: (response: any) => response,
  error: async (error: any) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized access - token expired or invalid');
      console.log('Request URL:', error.config?.url);
      
      // Only handle 401 errors if we're not already logging out and not on login endpoint
      if (!isLoggingOut && !error.config?.url?.includes('/auth/login')) {
        // Clear stored tokens
        await clearTokens();
        
        // Redirect to login if callback is set
        if (authRedirectCallback) {
          authRedirectCallback();
        }
      }
    }
    return Promise.reject(error);
  }
};