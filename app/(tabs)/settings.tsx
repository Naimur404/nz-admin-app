import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/use-theme';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

  const handleThemeToggle = async () => {
    try {
      const newTheme = isDarkMode ? 'light' : 'dark';
      setIsDarkMode(!isDarkMode);
      toggleTheme();
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
      Alert.alert('Error', 'Failed to save theme preference');
    }
  };

  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : '#1e40af' }]}>
        <Image 
          source={require('@/assets/images/mynztrip-white.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f5f5f5' }]}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Theme Section */}
          <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons 
                name="color-palette-outline" 
                size={24} 
                color={isDark ? '#60a5fa' : '#1e40af'} 
              />
              <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>
                Appearance
              </Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>
                  Dark Mode
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9ca3af' : '#666' }]}>
                  Switch between light and dark theme
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                trackColor={{ false: '#e5e7eb', true: '#60a5fa' }}
                thumbColor={isDarkMode ? '#1e40af' : '#f3f4f6'}
                ios_backgroundColor="#e5e7eb"
              />
            </View>
          </View>

          {/* App Info Section */}
          <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons 
                name="information-circle-outline" 
                size={24} 
                color={isDark ? '#60a5fa' : '#1e40af'} 
              />
              <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>
                About
              </Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>
                  App Version
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9ca3af' : '#666' }]}>
                  Version 1.0.0
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>
                  Privacy Policy
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9ca3af' : '#666' }]}>
                  View our privacy policy
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDark ? '#9ca3af' : '#666'} 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>
                  Terms of Service
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9ca3af' : '#666' }]}>
                  Read terms and conditions
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDark ? '#9ca3af' : '#666'} 
              />
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View style={[styles.section, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons 
                name="help-circle-outline" 
                size={24} 
                color={isDark ? '#60a5fa' : '#1e40af'} 
              />
              <Text style={[styles.sectionTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>
                Support
              </Text>
            </View>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>
                  Help & FAQ
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9ca3af' : '#666' }]}>
                  Get help and find answers
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDark ? '#9ca3af' : '#666'} 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: isDark ? '#f3f4f6' : '#333' }]}>
                  Contact Support
                </Text>
                <Text style={[styles.settingDescription, { color: isDark ? '#9ca3af' : '#666' }]}>
                  Reach out for assistance
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDark ? '#9ca3af' : '#666'} 
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
});