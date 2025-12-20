import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
  View,
} from "react-native";
import { colors } from "../../styles/colors";

// Clean, Professional Button Component

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
      default:
        return colors.white;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    textAlign: "center",
    fontWeight: "600",
  },

  // Variants
  primaryButton: {
    backgroundColor: colors.primary[600],
  },
  primaryText: {
    color: colors.white,
  },

  secondaryButton: {
    backgroundColor: colors.accent[500],
  },
  secondaryText: {
    color: colors.white,
  },

  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary[600],
  },
  outlineText: {
    color: colors.primary[600],
  },

  dangerButton: {
    backgroundColor: colors.error[500],
  },
  dangerText: {
    color: colors.white,
  },

  successButton: {
    backgroundColor: colors.success[500],
  },
  successText: {
    color: colors.white,
  },

  ghostButton: {
    backgroundColor: "transparent",
  },
  ghostText: {
    color: colors.primary[600],
  },

  glassButton: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  glassText: {
    color: colors.primary[700],
  },

  // Sizes
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36,
  },
  smallText: {
    fontSize: 13,
  },

  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 46,
  },
  mediumText: {
    fontSize: 15,
  },

  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  largeText: {
    fontSize: 16,
  },
});
