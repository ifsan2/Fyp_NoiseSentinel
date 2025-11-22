import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";

// PREMIUM SKELETON LOADER - $50K APP GRADE
// Shimmer effect for perceived performance
// Used while loading dashboard data, cards, lists

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius: radius = 8,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0)",
            "rgba(255, 255, 255, 0.5)",
            "rgba(255, 255, 255, 0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

// Pre-built skeleton layouts
export const SkeletonCard: React.FC = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonCardHeader}>
      <Skeleton width={60} height={60} borderRadius={30} />
      <View style={styles.skeletonCardText}>
        <Skeleton width="70%" height={20} borderRadius={8} />
        <Skeleton width="50%" height={16} borderRadius={8} style={{ marginTop: 8 }} />
      </View>
    </View>
    <Skeleton width="100%" height={60} borderRadius={12} style={{ marginTop: spacing.md }} />
  </View>
);

export const SkeletonStat: React.FC = () => (
  <View style={styles.skeletonStat}>
    <Skeleton width={40} height={40} borderRadius={20} />
    <Skeleton width="80%" height={32} borderRadius={8} style={{ marginTop: spacing.sm }} />
    <Skeleton width="60%" height={14} borderRadius={7} style={{ marginTop: spacing.xs }} />
  </View>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <View>
    {Array.from({ length: items }).map((_, index) => (
      <View key={index} style={styles.skeletonListItem}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.skeletonListText}>
          <Skeleton width="70%" height={18} borderRadius={9} />
          <Skeleton width="50%" height={14} borderRadius={7} style={{ marginTop: 8 }} />
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.neutral[200],
    overflow: "hidden",
  },
  shimmer: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
  skeletonCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: spacing.md,
  },
  skeletonCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonCardText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  skeletonStat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  skeletonListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: spacing.sm,
  },
  skeletonListText: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
