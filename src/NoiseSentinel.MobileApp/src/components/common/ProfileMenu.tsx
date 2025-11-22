import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { Lock, LogOut, User, X } from "lucide-react-native";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

const { width, height } = Dimensions.get("window");

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
        activeOpacity={0.8}
      >
        <View style={styles.avatarIcon}>
          <User size={20} color={colors.white} strokeWidth={2.5} />
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
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <X size={20} color={colors.white} strokeWidth={2.5} />
            </TouchableOpacity>

            {/* User Info Section */}
            <View style={styles.userInfoSection}>
              <View style={styles.userAvatarLarge}>
                <Text style={styles.userAvatarLargeText}>👮</Text>
              </View>
              <Text style={styles.userName}>{userName || "moiz"}</Text>
              <Text style={styles.userRole}>{userRole || "POLICE OFFICER"}</Text>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItemsContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleChangePassword}
                activeOpacity={0.8}
              >
                <View style={styles.menuIconContainer}>
                  <Lock size={20} color={colors.warning[600]} strokeWidth={2.5} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuItemText}>Change Password</Text>
                  <Text style={styles.menuItemSubtext}>Update your password</Text>
                </View>
                <View style={styles.menuArrowContainer}>
                  <Text style={styles.menuArrow}>→</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.logoutItem]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                  <LogOut size={20} color={colors.error[500]} strokeWidth={2.5} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
                  <Text style={styles.menuItemSubtext}>Sign out of your account</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    padding: spacing.xs - 2,
  },
  avatarIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary[600],
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary[400],
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: `0 2px 6px ${colors.primary[500]}30`,
      },
    }),
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(8px)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingRight: spacing.md,
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    width: Math.min(width - spacing.xxl, 320),
    maxWidth: 320,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: "0 8px 32px rgba(100, 116, 139, 0.12)",
      },
    }),
  },
  closeButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
      },
    }),
  },
  userInfoSection: {
    alignItems: "center",
    paddingTop: spacing.xl + spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary[600],
    position: "relative",
  },
  userAvatarLarge: {
    width: 72,
    height: 72,
    backgroundColor: colors.secondary,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.25)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
      },
    }),
  },
  userAvatarLargeText: {
    fontSize: 36,
  },
  userName: {
    ...typography.h3,
    fontSize: 22,
    color: colors.white,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  userRole: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.secondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  menuItemsContainer: {
    padding: spacing.lg,
    gap: spacing.sm + 2,
    backgroundColor: colors.background.secondary,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md + 4,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 6px rgba(100, 116, 139, 0.04)",
      },
    }),
  },
  logoutItem: {
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[100],
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: colors.warning[100],
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  logoutIconContainer: {
    backgroundColor: colors.error[100],
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  logoutText: {
    color: colors.error[600],
  },
  menuItemSubtext: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: "500",
    letterSpacing: 0,
  },
  menuArrowContainer: {
    marginLeft: spacing.xs,
  },
  menuArrow: {
    fontSize: 22,
    color: colors.primary[600],
    fontWeight: "600",
  },
});


