import React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../styles/colors";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  variant?: "default" | "primary";
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightComponent,
  variant = "default",
}) => {
  const insets = useSafeAreaInsets();
  const isPrimary = variant === "primary";

  return (
    <View
      style={[
        styles.container,
        isPrimary && styles.containerPrimary,
        { paddingTop: insets.top + 8 },
      ]}
    >
      <StatusBar
        barStyle={isPrimary ? "light-content" : "dark-content"}
        backgroundColor={isPrimary ? colors.primary[700] : colors.white}
      />
      <View style={styles.content}>
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft
                size={28}
                color={isPrimary ? colors.white : colors.text.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerContainer}>
          <Text
            style={[styles.title, isPrimary && styles.titlePrimary]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, isPrimary && styles.subtitlePrimary]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightContainer}>{rightComponent}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  containerPrimary: {
    backgroundColor: colors.primary[700],
    borderBottomWidth: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  leftContainer: {
    width: 48,
    alignItems: "flex-start",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
  },
  rightContainer: {
    width: 48,
    alignItems: "flex-end",
  },
  backButton: {
    padding: 4,
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: "700",
  },
  titlePrimary: {
    color: colors.white,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  subtitlePrimary: {
    color: "rgba(255,255,255,0.8)",
  },
});
