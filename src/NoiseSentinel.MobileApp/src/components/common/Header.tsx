import React from "react";
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
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
      <View style={styles.wrapper}>
        <BlurView intensity={40} tint="light" style={styles.blur}>
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
        </BlurView>
      </View>
      {variant === "elevated" && <View style={styles.borderAccent} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
  },
  wrapper: {
    backgroundColor: "transparent",
  },
  blur: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    minHeight: 64,
  },
  containerElevated: {
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  borderAccent: {
    height: 2,
    backgroundColor: colors.accent[400],
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
    color: colors.text.primary,
    fontWeight: "600",
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
    fontWeight: "600",
  },
});

