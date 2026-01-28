import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { Header } from "../../components/common/Header";
import { Card } from "../../components/common/Card";
import iotDeviceApi from "../../api/iotDeviceApi";
import { colors } from "../../styles/colors";
import { spacing, borderRadius } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface ChallanTypeSelectionScreenProps {
  navigation: any;
}

export const ChallanTypeSelectionScreen: React.FC<
  ChallanTypeSelectionScreenProps
> = ({ navigation }) => {
  const handleTrafficViolation = () => {
    navigation.navigate("CreateChallan", { challanType: "Traffic" });
  };

  const handleNonTrafficViolation = async () => {
    // Check if device is paired first
    try {
      const device = await iotDeviceApi.getPairedDevice();
      if (device && device.deviceId) {
        // Device is paired, proceed to CreateChallan
        navigation.navigate("CreateChallan", {
          challanType: "Non-Traffic",
          deviceId: device.deviceId,
        });
      } else {
        // No device paired, show message and redirect to PairDevice
        Toast.show({
          type: "info",
          text1: "Device Required",
          text2: "Please pair with an IoT device first",
          position: "top",
        });

        setTimeout(() => {
          navigation.navigate("PairDevice");
        }, 500);
      }
    } catch (error) {
      console.error("Error checking paired device:", error);
      Toast.show({
        type: "info",
        text1: "Device Required",
        text2: "Please pair with an IoT device first",
        position: "top",
      });

      setTimeout(() => {
        navigation.navigate("PairDevice");
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Select Challan Type"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Choose Violation Type</Text>
        <Text style={styles.subtitle}>
          Select the type of violation to create a challan
        </Text>

        {/* Traffic Violation Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleTrafficViolation}
          activeOpacity={0.7}
        >
          <Card variant="elevated">
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🚦</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Traffic Violation</Text>
                <Text style={styles.cardDescription}>
                  Regular traffic violations like speeding, signal jumping,
                  wrong parking, etc.
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>No Device Required</Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Non-Traffic Violation Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleNonTrafficViolation}
          activeOpacity={0.7}
        >
          <Card variant="elevated">
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔊</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Non-Traffic Violation</Text>
                <Text style={styles.cardDescription}>
                  Noise and emission violations that require IoT device scanning
                </Text>
                <View style={[styles.badge, styles.badgeWarning]}>
                  <Text style={[styles.badgeText, styles.badgeWarningText]}>
                    Device Required
                  </Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          </Card>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Non-traffic violations require pairing with an IoT device to measure
            noise levels or emissions
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: "flex-start",
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary[700],
    fontWeight: "600",
    fontSize: 11,
  },
  badgeWarning: {
    backgroundColor: colors.warning[50],
  },
  badgeWarningText: {
    color: colors.warning[700],
  },
  arrow: {
    fontSize: 32,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: colors.info[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.info[200],
    marginTop: spacing.md,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.info[700],
    fontSize: 13,
    flex: 1,
  },
});
