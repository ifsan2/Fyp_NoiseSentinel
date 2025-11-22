import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, Lock, Bell, Info, LogOut, ChevronRight } from "lucide-react-native";
import { colors } from "../../styles/colors";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";

export const ProfileScreen: React.FC = ({ navigation }: any) => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={40} color={colors.primary[500]} strokeWidth={2} />
          </View>
          <Text style={styles.userName}>{user?.username || "Officer"}</Text>
          <Text style={styles.userRole}>{user?.role || "Traffic Police"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <Card style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate("ChangePassword")}
            >
              <View style={styles.menuIcon}>
                <Lock size={20} color={colors.primary[500]} strokeWidth={2} />
              </View>
              <Text style={styles.menuText}>Change Password</Text>
              <ChevronRight size={20} color={colors.neutral[400]} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Bell size={20} color={colors.primary[500]} strokeWidth={2} />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
              <ChevronRight size={20} color={colors.neutral[400]} strokeWidth={2} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Info size={20} color={colors.primary[500]} strokeWidth={2} />
              </View>
              <Text style={styles.menuText}>About NoiseSentinel</Text>
              <ChevronRight size={20} color={colors.neutral[400]} strokeWidth={2} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.logoutContainer}>
          <Button 
            title="Logout" 
            onPress={handleLogout}
            variant="outline"
            style={{ borderColor: colors.error[500] }}
            textStyle={{ color: colors.error[500] }}
            icon={<LogOut size={20} color={colors.error[500]} strokeWidth={2} />}
          />
        </View>
        
        {/* Spacer for bottom tab bar */}
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
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    padding: 0, // Override default padding for list items
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 60,
  },
  logoutContainer: {
    marginTop: 8,
  },
});
