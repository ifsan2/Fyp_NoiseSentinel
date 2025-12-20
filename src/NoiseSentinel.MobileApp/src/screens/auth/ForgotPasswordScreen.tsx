import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Key, Lock, ChevronLeft, Shield } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { colors } from "../../styles/colors";
import { spacing, borderRadius } from "../../styles/spacing";
import authApi from "../../api/authApi";

type Step = "email" | "otp" | "password";

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Email Required",
        text2: "Please enter your email address",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address",
      });
      return;
    }

    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      Toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: "Check your email for the password reset code",
      });
      setStep("otp");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to send OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please enter the 6-digit code",
      });
      return;
    }

    try {
      setLoading(true);
      await authApi.verifyResetOtp(email, otp);
      Toast.show({
        type: "success",
        text1: "OTP Verified",
        text2: "Now set your new password",
      });
      setStep("password");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: error.response?.data?.message || "OTP verification failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Invalid Password",
        text2: "Password must be at least 6 characters",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Password Mismatch",
        text2: "Passwords do not match",
      });
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword(email, otp, newPassword, confirmPassword);
      Toast.show({
        type: "success",
        text1: "Password Reset!",
        text2: "You can now login with your new password",
      });
      navigation.navigate("Login");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to reset password",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      Toast.show({
        type: "success",
        text1: "OTP Resent",
        text2: "Check your email for the new code",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to resend OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <>
      <View style={styles.iconContainer}>
        <Mail size={48} color={colors.primary[600]} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a code to reset your
        password.
      </Text>

      <View style={styles.inputContainer}>
        <Input
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Mail size={20} color={colors.neutral[400]} />}
        />
      </View>

      <Button
        title="Send Reset Code"
        onPress={handleSendOtp}
        loading={loading}
        fullWidth
      />
    </>
  );

  const renderOtpStep = () => (
    <>
      <View style={styles.iconContainer}>
        <Key size={48} color={colors.primary[600]} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        We've sent a 6-digit code to {email}. Enter it below to verify.
      </Text>

      <View style={styles.inputContainer}>
        <Input
          label="Verification Code"
          placeholder="Enter 6-digit code"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          leftIcon={<Key size={20} color={colors.neutral[400]} />}
        />
      </View>

      <Button
        title="Verify Code"
        onPress={handleVerifyOtp}
        loading={loading}
        fullWidth
      />

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendOtp}
        disabled={loading}
      >
        <Text style={styles.resendText}>Didn't receive code? Resend</Text>
      </TouchableOpacity>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <View style={styles.iconContainer}>
        <Lock size={48} color={colors.primary[600]} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>Set New Password</Text>
      <Text style={styles.subtitle}>
        Create a strong password for your account.
      </Text>

      <View style={styles.inputContainer}>
        <Input
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          leftIcon={<Lock size={20} color={colors.neutral[400]} />}
        />
        <Input
          label="Confirm Password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          leftIcon={<Lock size={20} color={colors.neutral[400]} />}
        />
      </View>

      <Button
        title="Reset Password"
        onPress={handleResetPassword}
        loading={loading}
        fullWidth
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step === "email") {
                navigation.goBack();
              } else if (step === "otp") {
                setStep("email");
              } else {
                setStep("otp");
              }
            }}
          >
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Shield size={20} color={colors.primary[600]} strokeWidth={2} />
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progress}>
          <View
            style={[
              styles.progressDot,
              step === "email" && styles.progressDotActive,
            ]}
          />
          <View
            style={[
              styles.progressLine,
              step !== "email" && styles.progressLineActive,
            ]}
          />
          <View
            style={[
              styles.progressDot,
              step === "otp" && styles.progressDotActive,
            ]}
          />
          <View
            style={[
              styles.progressLine,
              step === "password" && styles.progressLineActive,
            ]}
          />
          <View
            style={[
              styles.progressDot,
              step === "password" && styles.progressDotActive,
            ]}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {step === "email" && renderEmailStep()}
            {step === "otp" && renderOtpStep()}
            {step === "password" && renderPasswordStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  progress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.neutral[200],
  },
  progressDotActive: {
    backgroundColor: colors.primary[600],
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.xs,
  },
  progressLineActive: {
    backgroundColor: colors.primary[600],
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  resendButton: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: "600",
  },
});
