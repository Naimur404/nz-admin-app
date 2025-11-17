import { useTheme } from '@/hooks/use-theme';
import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [fadeAnim]);

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? '#374151' : '#e5e7eb',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: isDark ? '#4b5563' : '#f3f4f6',
            opacity: fadeAnim,
            borderRadius,
          },
        ]}
      />
    </View>
  );
}

interface SkeletonCardProps {
  style?: ViewStyle;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.card, { backgroundColor: isDark ? '#1f2937' : '#fff' }, style]}>
      <Skeleton width="100%" height={16} style={styles.titleSkeleton} />
      <Skeleton width="70%" height={12} style={styles.subtitleSkeleton} />
      <Skeleton width="50%" height={12} style={styles.dateSkeleton} />
    </View>
  );
}

interface SkeletonListProps {
  itemCount?: number;
}

export function SkeletonList({ itemCount = 5 }: SkeletonListProps) {
  return (
    <View style={styles.list}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <SkeletonCard 
          key={index} 
          style={{
            ...styles.listItem,
            ...(index === 0 && styles.firstListItem), // Add margin top to first item
          }} 
        />
      ))}
    </View>
  );
}

interface SkeletonHeaderProps {
  showBackButton?: boolean;
  showActionButton?: boolean;
}

export function SkeletonHeader({ showBackButton = true, showActionButton = false }: SkeletonHeaderProps) {
  return (
    <View style={styles.header}>
      {showBackButton && <Skeleton width={24} height={24} borderRadius={12} />}
      <Skeleton width={120} height={20} style={styles.headerTitle} />
      {showActionButton && <Skeleton width={24} height={24} borderRadius={12} />}
    </View>
  );
}

interface SkeletonStatsProps {
  columns?: number;
}

export function SkeletonStats({ columns = 4 }: SkeletonStatsProps) {
  return (
    <View style={styles.statsContainer}>
      {Array.from({ length: columns }).map((_, index) => (
        <View key={index} style={styles.statCard}>
          <Skeleton width={32} height={32} borderRadius={16} style={styles.statIcon} />
          <Skeleton width="80%" height={16} style={styles.statNumber} />
          <Skeleton width="60%" height={12} style={styles.statLabel} />
        </View>
      ))}
    </View>
  );
}

interface SkeletonProfileProps {}

export function SkeletonProfile({}: SkeletonProfileProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.profileCard, { backgroundColor: isDark ? '#1f2937' : '#fff' }]}>
      <Skeleton width={80} height={80} borderRadius={40} style={styles.profileAvatar} />
      <Skeleton width={150} height={20} style={styles.profileName} />
      <Skeleton width={80} height={16} borderRadius={8} style={styles.profileType} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  subtitleSkeleton: {
    marginBottom: 6,
  },
  dateSkeleton: {
    marginBottom: 0,
  },
  list: {
    paddingHorizontal: 16,
  },
  listItem: {
    marginBottom: 12,
  },
  firstListItem: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    marginBottom: 4,
  },
  statLabel: {
    marginBottom: 0,
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
  profileAvatar: {
    marginBottom: 16,
  },
  profileName: {
    marginBottom: 8,
  },
  profileType: {
    marginBottom: 0,
  },
});