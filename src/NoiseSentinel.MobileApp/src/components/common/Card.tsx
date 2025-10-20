import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";

interface CardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: "default" | "outlined" | "elevated" | "primary" | "secondary";
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = "default",
}) => {
  const cardStyle = [styles.card, styles[variant], style];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  default: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  outlined: {
    borderWidth: 2,
    borderColor: colors.border,
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
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowMedium,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
