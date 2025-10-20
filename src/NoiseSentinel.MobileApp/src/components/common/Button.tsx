import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "danger"
    | "success"
    | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
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
}) => {
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
      baseStyle.opacity = 0.6;
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
        return colors.primary;
      case "secondary":
        return colors.primaryDark;
      default:
        return colors.white;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  text: {
    ...typography.button,
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Variants
  primaryButton: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  primaryText: {
    color: colors.white,
  },

  secondaryButton: {
    backgroundColor: colors.secondary,
    borderWidth: 0,
  },
  secondaryText: {
    color: colors.primaryDark,
  },

  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,
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
    color: colors.primary,
  },

  dangerButton: {
    backgroundColor: colors.error,
    borderWidth: 0,
  },
  dangerText: {
    color: colors.white,
  },

  successButton: {
    backgroundColor: colors.success,
    borderWidth: 0,
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
    color: colors.primary,
  },

  // Sizes
  smallButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  smallText: {
    fontSize: 13,
    fontWeight: "600",
  },

  mediumButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  mediumText: {
    fontSize: 15,
    fontWeight: "700",
  },

  largeButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  largeText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
