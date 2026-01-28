import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";
import { Header } from "../../components/common/Header";
import { Card } from "../../components/common/Card";
import { Loading } from "../../components/common/Loading";
import iotDeviceApi from "../../api/iotDeviceApi";
import { colors } from "../../styles/colors";
import { spacing, borderRadius } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface ViolationCategoryScreenProps {
  navigation: any;
}

export const ViolationCategoryScreen: React.FC<
  ViolationCategoryScreenProps
> = ({ navigation }) => {
  const [checkingDevice, setCheckingDevice] = useState(true);
  const [pairedDeviceId, setPairedDeviceId] = useState<number | null>(null);

  useEffect(() => {
    checkPairedDevice();
  }, []);

  // Re-check for paired device when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkPairedDevice();
    }, []),
  );

  const checkPairedDevice = async () => {
    try {
      const device = await iotDeviceApi.getPairedDevice();
      if (device) {
        setPairedDeviceId(device.deviceId);
      }
    } catch (error) {
      console.error("Error checking paired device:", error);
    } finally {
      setCheckingDevice(false);
    }
  };

  const handleDeviceCheck = (category: "Noise" | "Emission") => {
    if (!pairedDeviceId) {
      // Directly navigate to PairDevice - works seamlessly on both web and mobile
      Toast.show({
        type: "info",
        text1: "Device Required",
        text2: "Please pair with an IoT device first",
        position: "top",
      });

      // Navigate to PairDevice screen
      setTimeout(() => {
        const rootNavigation = navigation.getParent() || navigation;
        rootNavigation.navigate("PairDevice", {
          returnTo: "ViolationCategory",
          category: category,
        });
      }, 500);
      return;
    }

    // Device is paired, proceed to create challan
    navigation.navigate("CreateChallan", {
      challanType: "Non-Traffic",
      violationCategory: category,
      deviceId: pairedDeviceId,
    });
  };

  if (checkingDevice) {
    return (
      <View style={styles.container}>
        <Header
          title="Violation Category"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <Loading message="Checking device..." fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Violation Category"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Select Violation Category</Text>
        <Text style={styles.subtitle}>
          Choose the type of non-traffic violation
        </Text>

        {!pairedDeviceId && (
          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              No device paired. You'll be prompted to pair a device before
              proceeding.
            </Text>
          </View>
        )}

        {/* Noise Violation Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleDeviceCheck("Noise")}
          activeOpacity={0.7}
        >
          <Card variant="elevated">
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, styles.noiseIcon]}>
                <Text style={styles.icon}>🔊</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Noise Violation</Text>
                <Text style={styles.cardDescription}>
                  Measures exhaust sound levels (dBA) only
                </Text>
                <View style={styles.measurementBox}>
                  <Text style={styles.measurementLabel}>Measures:</Text>
                  <Text style={styles.measurementValue}>Sound Level (dBA)</Text>
                </View>
                <View style={styles.exampleBox}>
                  <Text style={styles.exampleText}>
                    Examples: Modified silencer, loud exhaust, noise pollution
                  </Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Emission Violation Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleDeviceCheck("Emission")}
          activeOpacity={0.7}
        >
          <Card variant="elevated">
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, styles.emissionIcon]}>
                <Text style={styles.icon}>💨</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Emission Violation</Text>
                <Text style={styles.cardDescription}>
                  Measures gas emissions only (no noise)
                </Text>
                <View style={styles.measurementBox}>
                  <Text style={styles.measurementLabel}>Measures:</Text>
                  <Text style={styles.measurementValue}>
                    CO, CO₂, HC, NOₓ levels
                  </Text>
                </View>
                <View style={styles.exampleBox}>
                  <Text style={styles.exampleText}>
                    Examples: Excessive emissions, smoke pollution, gas leaks
                  </Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          </Card>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>
              Both categories require IoT device scanning to measure violations
            </Text>
            {pairedDeviceId && (
              <Text style={styles.deviceInfo}>✓ Device paired and ready</Text>
            )}
          </View>
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
    marginBottom: spacing.lg,
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: colors.warning[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning[200],
    marginBottom: spacing.lg,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  warningText: {
    ...typography.body,
    color: colors.warning[700],
    fontSize: 13,
    flex: 1,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  noiseIcon: {
    backgroundColor: colors.accent[100],
  },
  emissionIcon: {
    backgroundColor: colors.warning[50],
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
  measurementBox: {
    backgroundColor: colors.background.secondary,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  measurementLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    marginBottom: 2,
  },
  measurementValue: {
    ...typography.body,
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  exampleBox: {
    paddingTop: spacing.xs,
  },
  exampleText: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontSize: 11,
    fontStyle: "italic",
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
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    ...typography.body,
    color: colors.info[700],
    fontSize: 13,
  },
  deviceInfo: {
    ...typography.caption,
    color: colors.success[700],
    fontSize: 12,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
});
