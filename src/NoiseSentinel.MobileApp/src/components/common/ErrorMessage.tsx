import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { spacing, borderRadius } from '../../styles/spacing';
import { typography } from '../../styles/typography';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Text style={styles.retryButton} onPress={onRetry}>
          Tap to retry
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.error + '10',
    borderWidth: 1,
    bordercolor: colors.error[600],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.error[600],
    textAlign: 'center',
  },
  retryButton: {
    ...typography.bodySmall,
    color: colors.error[700],
    marginTop: spacing.sm,
    textDecorationLine: 'underline',
  },
});

