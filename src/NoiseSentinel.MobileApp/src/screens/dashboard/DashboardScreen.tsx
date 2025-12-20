import React, { useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  Link,
  BarChart3,
  FileText,
  History,
  User as UserIcon,
  Car,
  AlertTriangle,
  ChevronRight,
  Shield,
} from "lucide-react-native";
import challanApi from "../../api/challanApi";
import { SkeletonStat } from "../../components/common/Skeleton";
import { ProfileMenu } from "../../components/common/ProfileMenu";
import { useAuth } from "../../contexts/AuthContext";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

const { width } = Dimensions.get("window");

// NoiseSentinel Dashboard
// Clean, professional design for traffic police enforcement

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
}) => {
  const { user, userDetails, logout } = useAuth();
  const [loading, setLoading] = useState(true);
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
      const challans = await challanApi.getMyChallans();

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
    } finally {
      setLoading(false);
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
      IconComponent: Link,
      color: colors.primary[600],
      onPress: () => navigation.navigate("PairDevice"),
    },
    {
      title: "Generate Report",
      IconComponent: BarChart3,
      color: colors.accent[600],
      onPress: () => navigation.navigate("CreateEmissionReport"),
    },
    {
      title: "Create Challan",
      IconComponent: FileText,
      color: colors.success[600],
      onPress: () => navigation.navigate("CreateChallan"),
    },
    {
      title: "My Challans",
      IconComponent: History,
      color: colors.warning[600],
      onPress: () => navigation.navigate("MyChallans"),
    },
  ];

  const searchActions = [
    {
      title: "Search Vehicle",
      description: "Find vehicle by plate number",
      IconComponent: Car,
      color: colors.primary[600],
      bgColor: colors.primary[50],
      onPress: () => navigation.navigate("SearchVehicle"),
    },
    {
      title: "Search Accused",
      description: "Find by name or CNIC",
      IconComponent: UserIcon,
      color: colors.accent[600],
      bgColor: colors.accent[50],
      onPress: () => navigation.navigate("SearchAccused"),
    },
    {
      title: "Violations List",
      description: "View violation types & penalties",
      IconComponent: AlertTriangle,
      color: colors.warning[600],
      bgColor: colors.warning[50],
      onPress: () => navigation.navigate("Violations"),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Shield size={24} color={colors.white} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.headerTitle}>NoiseSentinel</Text>
              <Text style={styles.headerSubtitle}>Traffic Police Portal</Text>
            </View>
          </View>
          <ProfileMenu
            userName={userDetails?.fullName || user?.fullName}
            userRole={userDetails?.role || user?.role}
            onChangePassword={() => navigation.navigate("ChangePassword")}
            onLogout={handleLogout}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[600]}
            colors={[colors.primary[600]]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Officer Info Card */}
        <View style={styles.officerCard}>
          <View style={styles.officerAvatar}>
            <UserIcon size={28} color={colors.primary[600]} strokeWidth={2} />
          </View>
          <View style={styles.officerInfo}>
            <Text style={styles.officerName}>
              {userDetails?.fullName || user?.fullName || "Officer"}
            </Text>
            <Text style={styles.officerRole}>
              {userDetails?.role || user?.role || "Traffic Police"}
            </Text>
            {userDetails?.badgeNumber && (
              <Text style={styles.officerBadge}>
                Badge #{userDetails.badgeNumber}
              </Text>
            )}
          </View>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>

          {loading ? (
            <View style={styles.statsRow}>
              <SkeletonStat />
              <SkeletonStat />
            </View>
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: colors.primary[50] },
                  ]}
                >
                  <FileText
                    size={24}
                    color={colors.primary[600]}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.statValue}>{stats.todayChallans}</Text>
                <Text style={styles.statLabel}>Today's Challans</Text>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: colors.accent[50] },
                  ]}
                >
                  <BarChart3
                    size={24}
                    color={colors.accent[600]}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.statValue}>{stats.totalChallans}</Text>
                <Text style={styles.statLabel}>Total Issued</Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <action.IconComponent
                    size={24}
                    color={action.color}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Search</Text>
          {searchActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.searchCard}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[styles.searchIcon, { backgroundColor: action.bgColor }]}
              >
                <action.IconComponent
                  size={22}
                  color={action.color}
                  strokeWidth={2}
                />
              </View>
              <View style={styles.searchContent}>
                <Text style={styles.searchTitle}>{action.title}</Text>
                <Text style={styles.searchDescription}>
                  {action.description}
                </Text>
              </View>
              <ChevronRight
                size={20}
                color={colors.neutral[400]}
                strokeWidth={2}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Government of Pakistan • Traffic Police Department
          </Text>
          <Text style={styles.footerSubtext}>
            NoiseSentinel v1.0 • {new Date().getFullYear()}
          </Text>
        </View>

        {/* Spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.primary[700],
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  officerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  officerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  officerInfo: {
    flex: 1,
  },
  officerName: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  officerRole: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  officerBadge: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  onlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success[50],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success[500],
    marginRight: 5,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.success[700],
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (width - 44) / 2,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
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
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  searchContent: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  searchDescription: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "500",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
});
