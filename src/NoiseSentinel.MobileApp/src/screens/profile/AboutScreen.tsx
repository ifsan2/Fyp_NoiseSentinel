import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Shield,
  Radio,
  Smartphone,
  Globe,
  Database,
  Lock,
  Zap,
  CheckCircle,
  Users,
  GitBranch,
} from "lucide-react-native";
import { colors } from "../../styles/colors";

export const AboutScreen: React.FC = ({ navigation }: any) => {
  const features = [
    {
      icon: <Radio size={20} color={colors.primary[600]} strokeWidth={2} />,
      title: "IoT Integration",
      description:
        "ESP32-powered noise and emission sensors with BLE connectivity",
    },
    {
      icon: <Smartphone size={20} color={colors.accent[600]} strokeWidth={2} />,
      title: "Mobile Field Enforcement",
      description:
        "Real-time challan creation with evidence capture and IoT device pairing",
    },
    {
      icon: <Globe size={20} color={colors.info[600]} strokeWidth={2} />,
      title: "Web Portal",
      description:
        "Administrative dashboards for station, court authorities, and judges",
    },
    {
      icon: <Database size={20} color={colors.success[600]} strokeWidth={2} />,
      title: "Complete Legal Lifecycle",
      description: "Challan → FIR → Case → Verdict with digital evidence chain",
    },
    {
      icon: <Lock size={20} color={colors.error[600]} strokeWidth={2} />,
      title: "Secure & Immutable",
      description:
        "JWT authentication, encrypted storage, and tamper-proof emission reports",
    },
    {
      icon: <Zap size={20} color={colors.warning[600]} strokeWidth={2} />,
      title: "Real-Time Testing",
      description:
        "10-second noise tests and 40-second emission tests with ML classification",
    },
  ];

  const techStack = [
    { category: "Mobile", tech: "React Native, Expo SDK 49, TypeScript" },
    { category: "Backend", tech: ".NET 8.0, ASP.NET Core, Entity Framework" },
    { category: "Database", tech: "SQL Server with 17+ entity models" },
    { category: "Web", tech: "React 18, TypeScript, Vite, Material-UI 5" },
    { category: "IoT", tech: "Arduino C++, ESP32 DevKit, BLE 4.2" },
    { category: "Auth", tech: "JWT Bearer Tokens, ASP.NET Identity" },
  ];

  const roles = [
    {
      role: "Police Officer",
      description: "Field enforcement, challan creation, IoT device operation",
    },
    {
      role: "Station Authority",
      description: "FIR creation, officer management, device registration",
    },
    {
      role: "Court Authority",
      description: "Case creation from FIRs, judge assignment",
    },
    {
      role: "Judge",
      description: "Case statements, hearing management, verdict delivery",
    },
    {
      role: "Admin",
      description: "User management, system configuration, full access",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={colors.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About NoiseSentinel</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.logoContainer}>
            <Shield size={48} color={colors.primary[600]} strokeWidth={2} />
          </View>
          <Text style={styles.appName}>NoiseSentinel</Text>
          <Text style={styles.appTagline}>Traffic Management System</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.heroDescription}>
            An integrated IoT, mobile, and web platform for noise and emission
            violation enforcement with full legal lifecycle management.
          </Text>
        </View>

        {/* System Architecture */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Architecture</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              NoiseSentinel follows a multi-tier architecture with IoT
              integration, connecting ESP32 sensors to mobile officers and
              web-based administrative systems through a centralized REST API.
            </Text>

            <View style={styles.architectureFlow}>
              <View style={styles.flowItem}>
                <Radio size={24} color={colors.primary[600]} strokeWidth={2} />
                <Text style={styles.flowText}>ESP32 IoT Devices</Text>
              </View>
              <View style={styles.flowArrow}>
                <Text style={styles.flowArrowText}>↓ BLE</Text>
              </View>
              <View style={styles.flowItem}>
                <Smartphone
                  size={24}
                  color={colors.accent[600]}
                  strokeWidth={2}
                />
                <Text style={styles.flowText}>Mobile App</Text>
              </View>
              <View style={styles.flowArrow}>
                <Text style={styles.flowArrowText}>↓ REST API</Text>
              </View>
              <View style={styles.flowItem}>
                <Database
                  size={24}
                  color={colors.success[600]}
                  strokeWidth={2}
                />
                <Text style={styles.flowText}>Backend Server</Text>
              </View>
              <View style={styles.flowArrow}>
                <Text style={styles.flowArrowText}>↓ REST API</Text>
              </View>
              <View style={styles.flowItem}>
                <Globe size={24} color={colors.info[600]} strokeWidth={2} />
                <Text style={styles.flowText}>Web Portal</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>{feature.icon}</View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Evidence Lifecycle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence Lifecycle</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              Complete digital chain from on-site testing to court verdict:
            </Text>
            <View style={styles.lifecycleContainer}>
              {[
                "IoT Device Testing",
                "Emission Report",
                "Challan Issuance",
                "FIR Filing",
                "Case Creation",
                "Court Proceedings",
                "Verdict Delivery",
              ].map((step, index) => (
                <View key={index} style={styles.lifecycleStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                  {index < 6 && <View style={styles.stepConnector} />}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Technology Stack */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technology Stack</Text>
          <View style={styles.card}>
            {techStack.map((item, index) => (
              <View key={index} style={styles.techRow}>
                <Text style={styles.techCategory}>{item.category}</Text>
                <Text style={styles.techValue}>{item.tech}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* User Roles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Roles</Text>
          {roles.map((item, index) => (
            <View key={index} style={styles.roleCard}>
              <View style={styles.roleHeader}>
                <Users size={18} color={colors.primary[600]} strokeWidth={2} />
                <Text style={styles.roleTitle}>{item.role}</Text>
              </View>
              <Text style={styles.roleDescription}>{item.description}</Text>
            </View>
          ))}
        </View>

        {/* Components */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Components</Text>
          <View style={styles.card}>
            <View style={styles.componentItem}>
              <Text style={styles.componentTitle}>🔌 ESP32 Firmware</Text>
              <Text style={styles.componentDesc}>
                IoT sensor device with MAX4466 (noise), MQ-7 (CO), MQ-2 (HC)
                sensors
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.componentItem}>
              <Text style={styles.componentTitle}>📱 Mobile App</Text>
              <Text style={styles.componentDesc}>
                Field enforcement app with BLE integration and offline
                capabilities
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.componentItem}>
              <Text style={styles.componentTitle}>🌐 Backend API</Text>
              <Text style={styles.componentDesc}>
                3-tier architecture with 15 services and 14 API controllers
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.componentItem}>
              <Text style={styles.componentTitle}>💻 Web Portal</Text>
              <Text style={styles.componentDesc}>
                Administrative dashboards with role-based access control
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 NoiseSentinel Project</Text>
          <Text style={styles.footerSubtext}>Traffic Police Department</Text>
          <Text style={styles.footerSubtext}>
            Final Year Project - Integrated Traffic Management System
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
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
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: 8,
  },
  version: {
    fontSize: 13,
    color: colors.text.tertiary,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
    fontWeight: "600",
  },
  heroDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
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
  cardDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  architectureFlow: {
    alignItems: "center",
  },
  flowItem: {
    alignItems: "center",
    paddingVertical: 12,
  },
  flowText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 8,
  },
  flowArrow: {
    paddingVertical: 4,
  },
  flowArrowText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: "600",
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
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
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.neutral[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  lifecycleContainer: {
    paddingLeft: 8,
  },
  lifecycleStep: {
    position: "relative",
    paddingLeft: 40,
    paddingBottom: 20,
  },
  stepNumber: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    paddingTop: 4,
  },
  stepConnector: {
    position: "absolute",
    left: 13,
    top: 28,
    width: 2,
    height: 20,
    backgroundColor: colors.primary[200],
  },
  techRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  techCategory: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 0.3,
  },
  techValue: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 0.7,
    textAlign: "right",
  },
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
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
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  roleDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginLeft: 26,
  },
  componentItem: {
    paddingVertical: 12,
  },
  componentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  componentDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: "500",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 2,
    textAlign: "center",
  },
});
