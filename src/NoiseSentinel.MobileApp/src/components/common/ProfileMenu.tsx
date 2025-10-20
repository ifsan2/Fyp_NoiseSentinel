import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface ProfileMenuProps {
  userName?: string;
  userRole?: string;
  onChangePassword: () => void;
  onLogout: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  userName,
  userRole,
  onChangePassword,
  onLogout,
}) => {
  const [visible, setVisible] = useState(false);

  const handleClose = () => setVisible(false);

  const handleChangePassword = () => {
    handleClose();
    onChangePassword();
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <>
      {/* Profile Button */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarIcon}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
      </TouchableOpacity>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.menuContainer}>
            {/* User Info Section */}
            <View style={styles.userInfoSection}>
              <View style={styles.userAvatarLarge}>
                <Text style={styles.userAvatarLargeText}>👮</Text>
              </View>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userRole}>{userRole}</Text>
            </View>

            <View style={styles.divider} />

            {/* Menu Items */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleChangePassword}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>🔒</Text>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemText}>Change Password</Text>
                <Text style={styles.menuItemSubtext}>Update your password</Text>
              </View>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View
                style={[styles.menuIconContainer, styles.logoutIconContainer]}
              >
                <Text style={styles.menuIcon}>🚪</Text>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuItemText, styles.logoutText]}>
                  Logout
                </Text>
                <Text style={styles.menuItemSubtext}>
                  Sign out of your account
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    padding: spacing.xs,
  },
  avatarIcon: {
    width: 36,
    height: 36,
    backgroundColor: colors.secondary,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.secondaryLight,
  },
  avatarText: {
    fontSize: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: Platform.OS === "ios" ? 90 : 70,
    paddingRight: spacing.md,
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    minWidth: 280,
    maxWidth: 320,
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
  userInfoSection: {
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  userAvatarLarge: {
    width: 64,
    height: 64,
    backgroundColor: colors.secondary,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: colors.secondaryLight,
  },
  userAvatarLargeText: {
    fontSize: 32,
  },
  userName: {
    ...typography.h4,
    color: colors.white,
    fontWeight: "700",
    marginBottom: 2,
  },
  userRole: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  logoutItem: {
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary + "10",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  logoutIconContainer: {
    backgroundColor: colors.error + "10",
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  logoutText: {
    color: colors.error,
    fontWeight: "600",
  },
  menuItemSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  menuArrow: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: "600",
  },
});
