import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

// PREMIUM LOADING COMPONENT
// Features: Pulse animations, Glassmorphism effects

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <Animated.View
          style={[
            styles.loaderContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={styles.loaderGlow} />
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </Animated.View>
        {message && (
          <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
            {message}
          </Animated.Text>
        )}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  loaderContainer: {
    position: 'relative',
    padding: spacing.xl,
  },
  loaderGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[400],
    opacity: 0.15,
    top: 0,
    left: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  message: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    fontWeight: '600',
  },
  messageSmall: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
});
