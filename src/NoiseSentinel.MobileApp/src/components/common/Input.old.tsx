import React, { useState, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

// PREMIUM INPUT COMPONENT
// Features: Floating labels, Glassmorphism, Focus animations, Premium states
// Inspired by: Linear, Stripe - Modern input design

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  variant?: "default" | "glass";
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required = false,
  leftIcon,
  rightIcon,
  helperText,
  secureTextEntry,
  variant = "default",
  value,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    
    Animated.parallel([
      Animated.spring(focusAnim, {
        toValue: 1,
        useNativeDriver: false,
        speed: 12,
        bounciness: 4,
      }),
      Animated.spring(labelAnim, {
        toValue: 1,
        useNativeDriver: false,
        speed: 12,
        bounciness: 4,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false,
      speed: 12,
      bounciness: 4,
    }).start();

    if (!value) {
      Animated.spring(labelAnim, {
        toValue: 0,
        useNativeDriver: false,
        speed: 12,
        bounciness: 4,
      }).start();
    }
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? colors.error[500] : colors.border.default,
      error ? colors.error[500] : colors.primary[500],
    ],
  });

  const borderWidth = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -10],
  });

  const labelFontSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text.tertiary, isFocused ? colors.primary[600] : colors.text.secondary],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.inputContainer,
          variant === "glass" && styles.inputContainerGlass,
          {
            borderColor,
            borderWidth,
          },
        ]}
      >
        {/* Floating Label */}
        {label && (
          <Animated.Text
            style={[
              styles.floatingLabel,
              {
                top: labelTop,
                fontSize: labelFontSize,
                color: error ? colors.error[500] : labelColor,
              },
            ]}
          >
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Animated.Text>
        )}

        <View style={styles.inputWrapper}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
            style={[styles.input, !!leftIcon && styles.inputWithLeftIcon]}
            placeholderTextColor={colors.neutral[400]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isSecure}
            value={value}
            {...textInputProps}
          />

          {secureTextEntry && (
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={() => setIsSecure(!isSecure)}
              activeOpacity={0.7}
            >
              <Text style={styles.eyeIcon}>{isSecure ? "👁️" : "👁️‍🗨️"}</Text>
            </TouchableOpacity>
          )}

          {!secureTextEntry && rightIcon && (
            <View style={styles.rightIcon}>{rightIcon}</View>
          )}
        </View>

        {/* Focus indicator line */}
        <Animated.View
          style={[
            styles.focusLine,
            {
              opacity: focusAnim,
              backgroundColor: error ? colors.error[500] : colors.primary[500],
            },
          ]}
        />
      </Animated.View>

      {error && (
        <View style={styles.messageContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {!error && helperText && (
        <View style={styles.messageContainer}>
          <Text style={styles.helperIcon}>💡</Text>
          <Text style={styles.helperText}>{helperText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    position: "relative",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    minHeight: 58,
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputContainerGlass: {
    backgroundColor: colors.glass.light,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  floatingLabel: {
    position: "absolute",
    left: spacing.md,
    backgroundColor: colors.white,
    paddingHorizontal: 4,
    fontWeight: "600",
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
    paddingTop: spacing.md + 4,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  eyeIcon: {
    fontSize: 20,
  },
  focusLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  required: {
    color: colors.error[500],
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    paddingLeft: spacing.xs,
  },
  errorIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  helperIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error[500],
    fontWeight: "500",
    flex: 1,
  },
  helperText: {
    ...typography.caption,
    color: colors.text.tertiary,
    flex: 1,
  },
});

