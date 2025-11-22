import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import authApi from "../../api/authApi";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Header } from "../../components/common/Header";
import { Input } from "../../components/common/Input";
import { ChangePasswordDto } from "../../models/Auth";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface ChangePasswordScreenProps {
  navigation: any;
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
  navigation,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validatePassword = (password: string): string => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return "Password must contain at least one special character (@$!%*?&)";
    }
    return "";
  };

  const validate = (): boolean => {
    let isValid = true;
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
      isValid = false;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const data: ChangePasswordDto = {
        currentPassword,
        newPassword,
        confirmPassword,
      };

      await authApi.changePassword(data);

      Toast.show({
        type: "success",
        text1: "Password Changed!",
        text2: "Your password has been updated successfully",
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error("❌ Change password error:", error);

      let errorMessage = "Failed to change password";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      }

      Toast.show({
        type: "error",
        text1: "Password Change Failed",
        text2: errorMessage,
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
      <Header
        title="Change Password"
        showBack
        onBackPress={() => navigation.goBack()}
        variant="elevated"
      />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Card variant="elevated">
          <View style={styles.headerSection}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.title}>Update Your Password</Text>
            <Text style={styles.subtitle}>
              Ensure your account security by using a strong password
            </Text>
          </View>

          <View style={styles.formSection}>
            <Input
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                setErrors({ ...errors, currentPassword: "" });
              }}
              error={errors.currentPassword}
              secureTextEntry
              required
            />

            <Input
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setErrors({ ...errors, newPassword: "" });
              }}
              error={errors.newPassword}
              secureTextEntry
              required
              helperText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
            />

            <Input
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors({ ...errors, confirmPassword: "" });
              }}
              error={errors.confirmPassword}
              secureTextEntry
              required
            />
          </View>

          <View style={styles.requirementsSection}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirement}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>Minimum 8 characters</Text>
            </View>
            <View style={styles.requirement}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>
                At least one uppercase letter (A-Z)
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>
                At least one lowercase letter (a-z)
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>
                At least one number (0-9)
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>
                At least one special character (@$!%*?&)
              </Text>
            </View>
          </View>

          <Button
            title={loading ? "Updating Password..." : "Change Password"}
            onPress={handleChangePassword}
            loading={loading}
            disabled={loading}
            fullWidth
            size="large"
            style={styles.submitButton}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.secondary[500],
  },
  lockIcon: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.primary[500],
    fontWeight: "700",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  requirementsSection: {
    backgroundColor: colors.primary[500] + "08",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[600],
  },
  requirementsTitle: {
    ...typography.bodySemibold,
    color: colors.primary[500],
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 13,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  requirementBullet: {
    ...typography.bodySmall,
    color: colors.primary[500],
    marginRight: spacing.sm,
    fontWeight: "700",
  },
  requirementText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});


