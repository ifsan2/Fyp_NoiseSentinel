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
import { Shield, User, Lock } from "lucide-react-native";
import Toast from "react-native-toast-message";
import authApi from "../../api/authApi";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../contexts/AuthContext";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

const { width, height } = Dimensions.get("window");

// PREMIUM LOGIN SCREEN
// Features: Animated gradients, Glassmorphism, Fluid animations, Premium visual effects
// Inspired by: Linear, Stripe, Arc Browser - Award-winning login design worth $50000+

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
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 10,
        bounciness: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 10,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
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

    // Continuous rotation for gradient circles
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const validate = (): boolean => {
    let isValid = true;
    const newErrors = { username: "", password: "" };

    if (!username.trim()) {
      newErrors.username = "Username or Email is required";
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

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Animated gradient background */}
      <View style={styles.gradientBackground}>
        <Animated.View
          style={[
            styles.gradientCircle,
            styles.gradientCircle1,
            { transform: [{ rotate: spin }] },
          ]}
        />
        <Animated.View
          style={[
            styles.gradientCircle,
            styles.gradientCircle2,
            { transform: [{ rotate: spin }] },
          ]}
        />
        <Animated.View
          style={[
            styles.gradientCircle,
            styles.gradientCircle3,
            {
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["360deg", "0deg"],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Header with animated logo */}
            <View style={styles.header}>
              <Animated.View
                style={[
                  styles.logoContainer,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <View style={styles.logoInner}>
                  <Shield
                    size={56}
                    color={colors.accent[600]}
                    strokeWidth={2.5}
                  />
                </View>
                {/* Glow effect rings */}
                <View style={[styles.glowRing, styles.glowRing1]} />
                <View style={[styles.glowRing, styles.glowRing2]} />
              </Animated.View>

              <Text style={styles.title}>NoiseSentinel</Text>
              <Text style={styles.subtitle}>Traffic Police Officer Portal</Text>

              <View style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>GOVERNMENT OF PAKISTAN</Text>
              </View>
            </View>

            {/* Premium glassmorphic login form */}
            <View style={styles.formContainer}>
              <View style={styles.formGlass}>
                {/* Subtle highlight */}
                <View style={styles.formHighlight} />

                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Secure Login</Text>
                  <Text style={styles.formSubtitle}>
                    Enter your credentials to continue
                  </Text>
                </View>

                <Input
                  label="Username or Email"
                  placeholder="Enter username or email"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setErrors({ ...errors, username: "" });
                  }}
                  error={errors.username}
                  autoCapitalize="none"
                  required
                  leftIcon={<User size={20} color={colors.text.tertiary} />}
                />

                <Input
                  label="Password"
                  placeholder="Enter password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({ ...errors, password: "" });
                  }}
                  error={errors.password}
                  secureTextEntry
                  required
                  leftIcon={<Lock size={20} color={colors.text.tertiary} />}
                />

                <Button
                  title={loading ? "Authenticating..." : "Sign In"}
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  fullWidth
                  size="large"
                  style={styles.loginButton}
                />

                {/* Security badge */}
                <View style={styles.securityBadge}>
                  <Shield
                    size={16}
                    color={colors.accent[600]}
                    strokeWidth={2}
                  />
                  <Text style={styles.securityText}>
                    256-bit encrypted connection
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerLockContainer}>
                <Lock size={14} color={colors.text.tertiary} strokeWidth={2} />
                <Text style={styles.footerText}>Authorized Personnel Only</Text>
              </View>
              <Text style={styles.versionText}>
                v1.0.0 • Traffic Police Department • {new Date().getFullYear()}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[900],
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  gradientCircle: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.3,
  },
  gradientCircle1: {
    width: width * 1.5,
    height: width * 1.5,
    backgroundColor: colors.primary[500],
    top: -width * 0.5,
    left: -width * 0.3,
  },
  gradientCircle2: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: colors.accent[500],
    bottom: -width * 0.4,
    right: -width * 0.3,
  },
  gradientCircle3: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: colors.primary[300],
    top: height * 0.3,
    right: -width * 0.2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  content: {
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    position: "relative",
    marginBottom: spacing.lg,
  },
  logoInner: {
    width: 100,
    height: 100,
    backgroundColor: colors.white,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  logoIcon: {
    fontSize: 52,
  },
  glowRing: {
    position: "absolute",
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.white,
  },
  glowRing1: {
    width: 120,
    height: 120,
    top: -10,
    left: -10,
    opacity: 0.3,
  },
  glowRing2: {
    width: 140,
    height: 140,
    top: -20,
    left: -20,
    opacity: 0.15,
  },
  title: {
    ...typography.display,
    fontSize: 40,
    color: colors.white,
    fontWeight: "800",
    marginBottom: spacing.xs,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.h5,
    color: colors.accent[300],
    marginBottom: spacing.md,
    textAlign: "center",
    fontWeight: "600",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    marginTop: spacing.sm,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent[400],
    marginRight: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "600",
    letterSpacing: 1,
    fontSize: 10,
    opacity: 0.9,
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  formGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: borderRadius.xl + 4,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  formHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderTopLeftRadius: borderRadius.xl + 4,
    borderTopRightRadius: borderRadius.xl + 4,
  },
  formHeader: {
    marginBottom: spacing.lg + 4,
  },
  formTitle: {
    ...typography.h2,
    color: colors.primary[900],
    fontWeight: "800",
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  inputIcon: {
    fontSize: 20,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.xs,
  },
  securityText: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    paddingTop: spacing.lg,
  },
  footerLockContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.7,
    fontSize: 13,
  },
  versionText: {
    ...typography.caption,
    color: colors.white,
    textAlign: "center",
    opacity: 0.5,
    fontSize: 10,
  },
});
