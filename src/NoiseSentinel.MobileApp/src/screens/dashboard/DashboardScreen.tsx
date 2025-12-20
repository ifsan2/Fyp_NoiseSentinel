import React, { useEffect, useState, useRef } from "react";
import {
  Animated as RNAnimated,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import Reanimated, { FadeInUp, Layout } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import {
  Link,
  BarChart3,
  FileText,
  History,
  Search,
  User as UserIcon,
  Car,
  AlertTriangle,
} from "lucide-react-native";
import challanApi from "../../api/challanApi";
import {
  SkeletonCard,
  SkeletonStat,
  SkeletonList,
} from "../../components/common/Skeleton";
import { Card } from "../../components/common/Card";
import { Header } from "../../components/common/Header";
import { ProfileMenu } from "../../components/common/ProfileMenu";
import { useAuth } from "../../contexts/AuthContext";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

const { width } = Dimensions.get("window");

// PREMIUM DASHBOARD SCREEN
// Features: Animated cards, Glassmorphism, Micro-interactions, Premium layouts
// Inspired by: Linear, Vercel, Arc Browser - Award-winning dashboard design worth $50000+

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

  // Animation values
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(30)).current;

  useEffect(() => {
    loadDashboardData();

    // Entrance animation
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      RNAnimated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
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
      gradient: [colors.primary[600], colors.primary[700]],
      onPress: () => navigation.navigate("PairDevice"),
    },
    {
      title: "Generate Report",
      IconComponent: BarChart3,
      gradient: [colors.accent[500], colors.accent[600]],
      onPress: () => navigation.navigate("CreateEmissionReport"),
    },
    {
      title: "Create Challan",
      IconComponent: FileText,
      gradient: [colors.primary[500], colors.primary[600]],
      onPress: () => navigation.navigate("CreateChallan"),
    },
    {
      title: "My Challans",
      IconComponent: History,
      gradient: [colors.accent[600], colors.accent[700]],
      onPress: () => navigation.navigate("MyChallans"),
    },
  ];

  const searchActions = [
    {
      title: "Search Vehicle",
      description: "Find vehicle records",
      IconComponent: Car,
      color: colors.primary[600],
      onPress: () => navigation.navigate("SearchVehicle"),
    },
    {
      title: "Search Accused",
      description: "Find accused records",
      IconComponent: UserIcon,
      color: colors.accent[600],
      onPress: () => navigation.navigate("SearchAccused"),
    },
    {
      title: "Violations List",
      description: "View all violations",
      IconComponent: AlertTriangle,
      color: colors.warning[500],
      onPress: () => navigation.navigate("Violations"),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Subtle gradient background */}
      <View style={styles.backgroundGradient}>
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
      </View>

      <Header
        title="NoiseSentinel"
        subtitle="Traffic Police Portal"
        variant="elevated"
        rightComponent={
          <ProfileMenu
            userName={userDetails?.fullName || user?.fullName}
            userRole={userDetails?.role || user?.role}
            onChangePassword={() => navigation.navigate("ChangePassword")}
            onLogout={handleLogout}
          />
        }
      />

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
        <RNAnimated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Premium Officer Card with glassmorphism */}
          <Reanimated.View
            entering={FadeInUp.duration(600)}
            layout={Layout.springify()}
          >
            <Card style={styles.officerCard} variant="glass">
              <View style={styles.officerHeader}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarGlow} />
                  <View style={styles.avatarInner}>
                    <UserIcon
                      size={40}
                      color={colors.primary[600]}
                      strokeWidth={2}
                    />
                  </View>
                </View>
                <View style={styles.officerInfo}>
                  <Text style={styles.officerName}>
                    {userDetails?.fullName || user?.fullName}
                  </Text>
                  <View style={styles.roleContainer}>
                    <View style={styles.roleDot} />
                    <Text style={styles.officerRole}>
                      {userDetails?.role?.toUpperCase() ||
                        user?.role?.toUpperCase()}
                    </Text>
                  </View>
                  {userDetails?.rank && (
                    <Text style={styles.officerBadge}>{userDetails.rank}</Text>
                  )}
                  {userDetails?.badgeNumber && (
                    <Text style={styles.officerBadge}>
                      Badge • {userDetails.badgeNumber}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </Reanimated.View>

          {/* Premium Statistics Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Performance Today</Text>
                <Text style={styles.sectionSubtitle}>Your daily metrics</Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.statsGrid}>
                <SkeletonStat />
                <SkeletonStat />
              </View>
            ) : (
              <View style={styles.statsGrid}>
                <Reanimated.View
                  entering={FadeInUp.duration(500).delay(50)}
                  layout={Layout.springify()}
                  style={styles.statCardWrapper}
                >
                  <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                      <FileText
                        size={28}
                        color={colors.primary[600]}
                        strokeWidth={2.5}
                      />
                    </View>
                    <Text style={styles.statValue}>{stats.todayChallans}</Text>
                    <Text style={styles.statLabel}>Today's Challans</Text>
                  </View>
                </Reanimated.View>

                <Reanimated.View
                  entering={FadeInUp.duration(500).delay(120)}
                  layout={Layout.springify()}
                  style={styles.statCardWrapper}
                >
                  <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                      <BarChart3
                        size={28}
                        color={colors.accent[600]}
                        strokeWidth={2.5}
                      />
                    </View>
                    <Text style={styles.statValue}>{stats.totalChallans}</Text>
                    <Text style={styles.statLabel}>Total Issued</Text>
                  </View>
                </Reanimated.View>
              </View>
            )}
          </View>

          {/* Premium Quick Actions Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <Text style={styles.sectionSubtitle}>Common operations</Text>
              </View>
            </View>

            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <Reanimated.View
                  key={index}
                  entering={FadeInUp.duration(500).delay(200 + index * 60)}
                  layout={Layout.springify()}
                >
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={action.onPress}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionCardInner}>
                      <View style={styles.actionIconContainer}>
                        <action.IconComponent
                          size={28}
                          color={colors.accent[600]}
                          strokeWidth={2}
                        />
                      </View>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <View style={styles.actionArrow}>
                        <Text style={styles.actionArrowText}>→</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Reanimated.View>
              ))}
            </View>
          </View>

          {/* Premium Search Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Database Search</Text>
                <Text style={styles.sectionSubtitle}>Quick lookup tools</Text>
              </View>
            </View>

            {searchActions.map((action, index) => (
              <Reanimated.View
                key={index}
                entering={FadeInUp.duration(500).delay(420 + index * 60)}
                layout={Layout.springify()}
              >
                <TouchableOpacity
                  style={styles.searchCard}
                  onPress={action.onPress}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.searchIconContainer,
                      { backgroundColor: `${action.color}15` },
                    ]}
                  >
                    <action.IconComponent
                      size={24}
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
                  <View style={styles.searchArrow}>
                    <Text style={styles.searchArrowText}>→</Text>
                  </View>
                </TouchableOpacity>
              </Reanimated.View>
            ))}
          </View>

          {/* Premium Footer */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerText}>
              Government of Pakistan • Traffic Police Department
            </Text>
            <Text style={styles.footerSubtext}>
              Authorized Personnel Only • {new Date().getFullYear()}
            </Text>
          </View>

          {/* Spacer for bottom tab bar - 8pt grid system */}
          <View style={{ height: 96 }} />
        </RNAnimated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  gradientCircle1: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: colors.primary[100],
    opacity: 0.3,
    top: -width * 0.4,
    right: -width * 0.3,
  },
  gradientCircle2: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: colors.accent[100],
    opacity: 0.3,
    bottom: width * 0.2,
    left: -width * 0.2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  officerCard: {
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  officerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  avatarGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[400],
    opacity: 0.2,
    top: -5,
    left: -5,
  },
  avatarInner: {
    width: 70,
    height: 70,
    backgroundColor: colors.white,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primary[400],
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  avatarText: {
    fontSize: 36,
  },
  officerInfo: {
    flex: 1,
  },
  officerName: {
    ...typography.h3,
    color: colors.primary[900],
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success[500],
    marginRight: spacing.xs,
  },
  officerRole: {
    ...typography.bodySmall,
    color: colors.primary[700],
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  officerBadge: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontWeight: "600",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    fontWeight: "500",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success[500],
    marginRight: spacing.xs,
  },
  liveBadgeText: {
    ...typography.caption,
    color: colors.success[700],
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCardWrapper: {
    width: (width - spacing.md * 3) / 2,
  },
  statCard: {
    width: (width - spacing.md * 3) / 2,
    padding: spacing.xl,
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xxl,
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 4px 16px rgba(100, 116, 139, 0.06)",
      },
    }),
  },
  statIconContainer: {
    position: "relative",
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
  },
  statIconGlow: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    opacity: 0.3,
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    ...typography.display,
    fontSize: 48,
    color: colors.text.primary,
    fontWeight: "800",
    marginBottom: spacing.xs,
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: "600",
    letterSpacing: 0,
    marginBottom: spacing.sm,
  },
  statProgress: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    overflow: "hidden",
  },
  statProgressBar: {
    height: "100%",
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  actionCard: {
    width: (width - spacing.md * 3) / 2,
    aspectRatio: 1.2,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow.default,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionCardInner: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  actionArrow: {
    alignSelf: "flex-end",
  },
  actionArrowText: {
    fontSize: 24,
    color: colors.primary[600],
    fontWeight: "600",
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.md + 2,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  searchContent: {
    flex: 1,
  },
  searchTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  searchDescription: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontWeight: "500",
  },
  searchArrow: {
    marginLeft: spacing.sm,
  },
  searchArrowText: {
    fontSize: 20,
    color: colors.text.tertiary,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  footerDivider: {
    width: 60,
    height: 3,
    backgroundColor: colors.primary[600],
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: "center",
  },
});
