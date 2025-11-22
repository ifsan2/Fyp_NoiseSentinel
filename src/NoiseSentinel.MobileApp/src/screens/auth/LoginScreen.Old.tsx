import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import authApi from "../../api/authApi";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../contexts/AuthContext";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

const { width } = Dimensions.get("window");

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });

  // Premium animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const validate = (): boolean => {
    let isValid = true;
    const newErrors = { username: "", password: "" };

    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      console.log("🔑 Login attempt:", { username });

      const response = await authApi.login({ username, password });

      console.log("✅ Login response received:", response);

      // Check if user is a Police Officer
      if (response.role !== "Police Officer") {
        Toast.show({
          type: "error",
          text1: "Access Denied",
          text2: "This portal is only for Police Officers",
        });
        setLoading(false);
        return;
      }

      // Save token and user data
      await login(response.token, response);

      Toast.show({
        type: "success",
        text1: "Welcome!",
        text2: `Logged in as ${response.fullName}`,
      });
    } catch (error: any) {
      console.error("❌ Login error:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error message:", error.message);

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2:
          error.response?.data?.message ||
          error.message ||
          "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🔊</Text>
          </View>
          <Text style={styles.title}>NoiseSentinel</Text>
          <Text style={styles.subtitle}>Traffic Police Officer Portal</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>GOVERNMENT OF PAKISTAN</Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Secure Login</Text>
            <Text style={styles.formSubtitle}>Enter your credentials</Text>
          </View>

          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setErrors({ ...errors, username: "" });
            }}
            error={errors.username}
            autoCapitalize="none"
            required
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: "" });
            }}
            error={errors.password}
            secureTextEntry
            required
          />

          <Button
            title={loading ? "Authenticating..." : "Login"}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            fullWidth
            size="large"
            style={styles.loginButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            � Authorized Personnel Only • Secure Access
          </Text>
          <Text style={styles.versionText}>
            v1.0.0 • Traffic Police Department
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[900],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: colors.secondary,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    borderWidth: 4,
    borderColor: colors.secondaryLight,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoIcon: {
    fontSize: 64,
  },
  title: {
    ...typography.display,
    color: colors.white,
    marginBottom: spacing.xs,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtitle: {
    ...typography.h4,
    color: colors.secondary,
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: colors.accent[700],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary[900],
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  formHeader: {
    marginBottom: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.secondary,
    paddingBottom: spacing.md,
  },
  formTitle: {
    ...typography.h2,
    color: colors.primary[700],
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  loginButton: {
    marginTop: spacing.lg,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.secondary,
    marginBottom: spacing.sm,
    fontWeight: "600",
    textAlign: "center",
  },
  versionText: {
    ...typography.caption,
    color: colors.secondaryLight,
    textAlign: "center",
  },
});


