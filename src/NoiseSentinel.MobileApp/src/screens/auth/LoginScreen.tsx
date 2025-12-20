import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Shield, User, Lock } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import authApi from "../../api/authApi";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../contexts/AuthContext";
import { colors } from "../../styles/colors";
import { spacing } from "../../styles/spacing";

const { width } = Dimensions.get("window");

// NoiseSentinel Login Screen
// Clean, professional design for government traffic enforcement app

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });

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

      // ✅ Check if email verification is required
      if (response.requiresEmailVerification) {
        Toast.show({
          type: "info",
          text1: "Email Verification Required",
          text2: "Please verify your email first",
        });
        setLoading(false);
        // Navigate to email verification screen
        (navigation as any).navigate("VerifyEmail", { email: response.email });
        return;
      }

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

      // ✅ Check if password change is required BEFORE saving token
      if (response.mustChangePassword) {
        Toast.show({
          type: "info",
          text1: "Password Change Required",
          text2: "You must change your temporary password",
        });
        setLoading(false);
        // Navigate to ChangePassword with token and user data
        (navigation as any).navigate("ChangePassword", {
          token: response.token,
          userData: response,
          fromLogin: true,
        });
        return;
      }

      // Save token and user data (only if password change NOT required)
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
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary[800]}
      />

      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <Shield size={40} color={colors.white} strokeWidth={2} />
        </View>
        <Text style={styles.appTitle}>NoiseSentinel</Text>
        <Text style={styles.appSubtitle}>Traffic Police Portal</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>GOVERNMENT OF PAKISTAN</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.formSection}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Login Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign In</Text>
            <Text style={styles.formSubtitle}>
              Enter your credentials to continue
            </Text>

            <View style={styles.inputsContainer}>
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
                leftIcon={<User size={18} color={colors.neutral[400]} />}
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
                leftIcon={<Lock size={18} color={colors.neutral[400]} />}
              />

              <Button
                title={loading ? "Signing In..." : "Sign In"}
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                fullWidth
                size="large"
                style={styles.loginButton}
              />

              <TouchableOpacity
                style={styles.forgotPasswordLink}
                onPress={() => (navigation as any).navigate("ForgotPassword")}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.securityNote}>
              <Shield size={14} color={colors.neutral[400]} strokeWidth={2} />
              <Text style={styles.securityText}>
                Secure encrypted connection
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Authorized Personnel Only</Text>
            <Text style={styles.versionText}>
              Version 1.0 • Traffic Police Department •{" "}
              {new Date().getFullYear()}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[800],
  },
  headerSection: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingBottom: 30,
    backgroundColor: colors.primary[800],
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    marginBottom: 16,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1,
  },
  formSection: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 28,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  inputsContainer: {
    gap: 4,
  },
  loginButton: {
    marginTop: 12,
  },
  forgotPasswordLink: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: "600",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    color: colors.neutral[400],
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: "500",
    marginBottom: 4,
  },
  versionText: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
});
