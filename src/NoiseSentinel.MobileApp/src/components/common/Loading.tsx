import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={colors.primary} />
      {message && <Text style={styles.messageSmall}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  messageSmall: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});