import React, { useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import challanApi from "../../api/challanApi";
import { Card } from "../../components/common/Card";
import { Header } from "../../components/common/Header";
import { ProfileMenu } from "../../components/common/ProfileMenu";
import { useAuth } from "../../contexts/AuthContext";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
}) => {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalChallans: 0,
    todayChallans: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load challans (always accessible to officers)
      const challans = await challanApi.getMyChallans();

      // Calculate today's challans
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayChallans = challans.filter((c) => {
        const issueDate = new Date(c.issueDateTime);
        issueDate.setHours(0, 0, 0, 0);
        return issueDate.getTime() === today.getTime();
      });

      setStats({
        totalChallans: challans.length,
        todayChallans: todayChallans.length,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    Toast.show({
      type: "info",
      text1: "Logged Out",
      text2: "See you soon!",
    });
  };

  const quickActions = [
    {
      title: "Pair Device",
      icon: "🔗",
      color: colors.accent,
      onPress: () => navigation.navigate("PairDevice"),
    },
    {
      title: "Generate Report",
      icon: "📊",
      color: colors.primary,
      onPress: () => navigation.navigate("CreateEmissionReport"),
    },
    {
      title: "Create Challan",
      icon: "📝",
      color: colors.secondary,
      onPress: () => navigation.navigate("CreateChallan"),
    },
    {
      title: "My Challans",
      icon: "📋",
      color: colors.primaryLight,
      onPress: () => navigation.navigate("MyChallans"),
    },
  ];

  const searchActions = [
    {
      title: "Search Vehicle",
      icon: "🚗",
      onPress: () => navigation.navigate("SearchVehicle"),
    },
    {
      title: "Search Accused",
      icon: "👤",
      onPress: () => navigation.navigate("SearchAccused"),
    },
    {
      title: "Violations List",
      icon: "⚠️",
      onPress: () => navigation.navigate("Violations"),
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="NoiseSentinel"
        subtitle="Traffic Police Portal"
        variant="elevated"
        rightComponent={
          <ProfileMenu
            userName={user?.fullName}
            userRole={user?.role}
            onChangePassword={() => navigation.navigate("ChangePassword")}
            onLogout={handleLogout}
          />
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Officer Info Card */}
        <Card style={styles.officerCard} variant="primary">
          <View style={styles.officerHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>👮</Text>
            </View>
            <View style={styles.officerInfo}>
              <Text style={styles.officerName}>{user?.fullName}</Text>
              <Text style={styles.officerRole}>{user?.role}</Text>
              <Text style={styles.officerBadge}>
                Badge: {user?.username?.toUpperCase()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance Today</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>STATS</Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard} variant="elevated">
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📝</Text>
              </View>
              <Text style={styles.statValue}>{stats.todayChallans}</Text>
              <Text style={styles.statLabel}>Today's Challans</Text>
            </Card>
            <Card style={styles.statCard} variant="elevated">
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📊</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalChallans}</Text>
              <Text style={styles.statLabel}>Total Issued</Text>
            </Card>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>OPERATIONS</Text>
            </View>
          </View>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionButton, { backgroundColor: action.color }]}
                onPress={action.onPress}
                activeOpacity={0.85}
              >
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Database Search</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>LOOKUP</Text>
            </View>
          </View>
          {searchActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.searchButton}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.searchIconContainer}>
                <Text style={styles.searchIcon}>{action.icon}</Text>
              </View>
              <Text style={styles.searchTitle}>{action.title}</Text>
              <Text style={styles.searchArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Government of Pakistan • Traffic Police Department
          </Text>
          <Text style={styles.footerSubtext}>
            Authorized Personnel Only • {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  officerCard: {
    marginBottom: spacing.lg,
  },
  officerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 70,
    height: 70,
    backgroundColor: colors.secondary,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    borderWidth: 3,
    borderColor: colors.secondaryLight,
  },
  avatarText: {
    fontSize: 36,
  },
  officerInfo: {
    flex: 1,
  },
  officerName: {
    ...typography.h3,
    color: colors.white,
    fontWeight: "700",
    marginBottom: 2,
  },
  officerRole: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  officerBadge: {
    ...typography.caption,
    color: colors.secondaryLight,
    fontWeight: "500",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sectionBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  sectionBadgeText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: colors.primary + "15",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    ...typography.display,
    color: colors.primary,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  actionButton: {
    width: "48%",
    minHeight: 120,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  actionIcon: {
    fontSize: 32,
  },
  actionTitle: {
    ...typography.bodySemibold,
    color: colors.white,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 13,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary + "10",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  searchArrow: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
