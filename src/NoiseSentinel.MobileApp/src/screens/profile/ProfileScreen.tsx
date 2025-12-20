import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Lock,
  Bell,
  Info,
  LogOut,
  ChevronRight,
  Shield,
} from "lucide-react-native";
import { colors } from "../../styles/colors";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/common/Button";

export const ProfileScreen: React.FC = ({ navigation }: any) => {
  const { logout, user, userDetails } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Shield size={20} color={colors.white} strokeWidth={2} />
          </View>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User size={32} color={colors.primary[600]} strokeWidth={2} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {userDetails?.fullName || user?.fullName || "Officer"}
            </Text>
            <Text style={styles.userRole}>
              {userDetails?.role || user?.role || "Traffic Police"}
            </Text>
            {userDetails?.badgeNumber && (
              <Text style={styles.userBadge}>
                Badge #{userDetails.badgeNumber}
              </Text>
            )}
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("ChangePassword")}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: colors.primary[50] },
                ]}
              >
                <Lock size={18} color={colors.primary[600]} strokeWidth={2} />
              </View>
              <Text style={styles.menuText}>Change Password</Text>
              <ChevronRight
                size={18}
                color={colors.neutral[400]}
                strokeWidth={2}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: colors.accent[50] },
                ]}
              >
                <Bell size={18} color={colors.accent[600]} strokeWidth={2} />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
              <ChevronRight
                size={18}
                color={colors.neutral[400]}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View
                style={[styles.menuIcon, { backgroundColor: colors.info[50] }]}
              >
                <Info size={18} color={colors.info[600]} strokeWidth={2} />
              </View>
              <Text style={styles.menuText}>About NoiseSentinel</Text>
              <ChevronRight
                size={18}
                color={colors.neutral[400]}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
            textStyle={{ color: colors.error[600] }}
            icon={
              <LogOut size={18} color={colors.error[600]} strokeWidth={2} />
            }
            fullWidth
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>NoiseSentinel v1.0</Text>
          <Text style={styles.footerSubtext}>Traffic Police Department</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.primary[700],
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.white,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  userBadge: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 62,
  },
  logoutContainer: {
    marginTop: 8,
  },
  logoutButton: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: "500",
    marginBottom: 2,
  },
  footerSubtext: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
});
