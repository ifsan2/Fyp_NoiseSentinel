import React, { useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";

// PREMIUM CARD COMPONENT
// Features: Glassmorphism, Micro-interactions, Scale animations, Premium shadows
// Inspired by: Linear, Vercel, Arc Browser - Award-winning card design

interface CardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: "default" | "outlined" | "elevated" | "primary" | "glass" | "gradient";
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = "default",
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }).start();
    }
  };

  const cardStyle = [styles.card, styles[variant], style];

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={cardStyle}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {/* Subtle highlight overlay */}
          {variant !== "glass" && (
            <View style={styles.highlightOverlay} pointerEvents="none" />
          )}
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={cardStyle}>
      {variant !== "glass" && (
        <View style={styles.highlightOverlay} pointerEvents="none" />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: spacing.md,
    position: "relative",
    overflow: "hidden",
  },
  highlightOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  
  // Variants - Premium designs
  default: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: colors.white,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  elevated: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: colors.white,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primary: {
    backgroundColor: colors.primary[600],
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  glass: {
    backgroundColor: colors.glass.light,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradient: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[400],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

