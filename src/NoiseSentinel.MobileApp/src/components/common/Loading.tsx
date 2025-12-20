import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors } from "../../styles/colors";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

// Clean Loading Component

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = "Loading...",
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={colors.primary[600]} />
      {message && <Text style={styles.messageSmall}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
  },
  loaderCard: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  message: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontWeight: "500",
  },
  messageSmall: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
});
