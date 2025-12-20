import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import authApi from "../../api/authApi";
import { useAuth } from "../../contexts/AuthContext";

const VerifyEmailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    // Get email from navigation params
    const params = route.params as any;
    if (params?.email) {
      setEmail(params.email);
    }
  }, [route.params]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (!email.trim()) {
      Alert.alert("Error", "Email address is required");
      return;
    }

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const authData = await authApi.verifyEmail({
        email: email.trim(),
        otp: otpCode,
      });

      console.log("✅ Email verified! Auth data:", authData);

      // ✅ Save token - AppNavigator will handle forced password change if needed
      await login(authData.token, authData);

      if (authData.mustChangePassword) {
        Alert.alert(
          "Email Verified!",
          "Your email has been verified. Please change your temporary password."
        );
        // AppNavigator will automatically show ChangePassword screen
      } else {
        Alert.alert(
          "Email Verified!",
          "Your email has been verified successfully."
        );
        // AppNavigator will automatically show MainNavigator
      }
    } catch (error: any) {
      console.error("❌ Email verification error:", error);
      Alert.alert(
        "Verification Failed",
        error.response?.data?.message ||
          error.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email address is required");
      return;
    }

    if (countdown > 0) {
      Alert.alert("Please wait", `You can resend OTP in ${countdown} seconds`);
      return;
    }

    try {
      setResendLoading(true);
      const message = await authApi.resendOtp({ email: email.trim() });

      Alert.alert("Success", message);
      setCountdown(60); // 60 seconds cooldown
      setOtp(["", "", "", "", "", ""]); // Clear OTP inputs
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error("❌ Resend OTP error:", error);
      Alert.alert(
        "Resend Failed",
        error.response?.data?.message ||
          error.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setResendLoading(false);
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Verify Email</Text>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={80} color="#007AFF" />
        </View>

        {/* Instructions */}
        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to
        </Text>
        <Text style={styles.emailText}>{email || "your email"}</Text>

        {/* Email Input (editable) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.emailInput}
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading && !resendLoading}
          />
        </View>

        {/* OTP Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Verification Code</Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!loading && !resendLoading}
              />
            ))}
          </View>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            loading || resendLoading ? styles.buttonDisabled : null,
          ]}
          onPress={handleVerify}
          disabled={loading || resendLoading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Email</Text>
          )}
        </TouchableOpacity>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>Resend in {countdown}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
              {resendLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.resendLink}>Resend Code</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.helpText}>
            The code is valid for 15 minutes. Check your spam folder if you
            don't see it.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    textAlign: "center",
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emailInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#333",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  otpInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  otpInputFilled: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f7ff",
  },
  verifyButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: "#666",
  },
  resendLink: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  countdownText: {
    fontSize: 14,
    color: "#999",
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    lineHeight: 18,
  },
});

export default VerifyEmailScreen;
