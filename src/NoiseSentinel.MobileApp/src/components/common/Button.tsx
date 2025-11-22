import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
  View,
} from "react-native";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

// PREMIUM BUTTON COMPONENT
// Features: Glassmorphism, Micro-interactions, Scale animations, Premium shadows
// Inspired by: Linear, Stripe, Arc Browser - World-class button design

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "danger"
    | "success"
    | "ghost"
    | "glass";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[`${variant}Button`],
      ...styles[`${size}Button`],
    };

    if (fullWidth) {
      baseStyle.width = "100%";
    }

    if (disabled || loading) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    return {
      ...styles.text,
      ...styles[`${variant}Text`],
      ...styles[`${size}Text`],
    };
  };

  const getLoaderColor = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return colors.primary[600];
      case "secondary":
        return colors.white;
      case "glass":
        return colors.primary[600];
      default:
        return colors.white;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {/* Shimmer effect overlay for primary/secondary */}
        {(variant === "primary" || variant === "secondary") && !disabled && !loading && (
          <View style={styles.shimmerOverlay} pointerEvents="none" />
        )}
        
        {loading ? (
          <ActivityIndicator color={getLoaderColor()} size="small" />
        ) : (
          <View style={styles.contentContainer}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.lg,
    position: "relative",
    overflow: "hidden",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    opacity: 0,
  },
  text: {
    ...typography.button,
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Variants - Premium design
  primaryButton: {
    backgroundColor: colors.primary[600],
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  primaryText: {
    color: colors.white,
  },

  secondaryButton: {
    backgroundColor: colors.accent[500],
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.accent[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  secondaryText: {
    color: colors.white,
  },

  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary[600],
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  outlineText: {
    color: colors.primary[600],
  },

  dangerButton: {
    backgroundColor: colors.error[500],
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.error[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  dangerText: {
    color: colors.white,
  },

  successButton: {
    backgroundColor: colors.success[500],
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.success[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  successText: {
    color: colors.white,
  },

  ghostButton: {
    backgroundColor: "transparent",
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  ghostText: {
    color: colors.primary[600],
  },

  glassButton: {
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
  glassText: {
    color: colors.primary[700],
  },

  // Sizes - Premium spacing
  smallButton: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 4,
    minHeight: 40,
  },
  smallText: {
    fontSize: 13,
    fontWeight: "600",
  },

  mediumButton: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg + 4,
    minHeight: 52,
  },
  mediumText: {
    fontSize: 15,
    fontWeight: "700",
  },

  largeButton: {
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.xl + 4,
    minHeight: 60,
  },
  largeText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});

