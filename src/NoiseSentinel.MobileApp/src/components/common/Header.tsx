import React from "react";
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../styles/colors";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  variant?: "default" | "elevated";
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightComponent,
  variant = "default",
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          variant === "elevated" && styles.containerElevated,
        ]}
      >
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightContainer}>{rightComponent}</View>
      </View>
      {variant === "elevated" && <View style={styles.borderAccent} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.primary,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    minHeight: 60,
  },
  containerElevated: {
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  borderAccent: {
    height: 3,
    backgroundColor: colors.secondary,
  },
  leftContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerContainer: {
    flex: 2,
    alignItems: "center",
  },
  rightContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  backIcon: {
    fontSize: 28,
    color: colors.secondary,
    fontWeight: "600",
  },
  title: {
    ...typography.h3,
    color: colors.white,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitle: {
    ...typography.caption,
    color: colors.secondary,
    marginTop: 2,
  },
});
