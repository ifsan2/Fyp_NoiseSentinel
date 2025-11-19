import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { IotDeviceListItemDto } from "../../models/IotDevice";
import { colors } from "../../styles/colors";
import { spacing, borderRadius } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface DeviceCardProps {
  device: IotDeviceListItemDto;
  onPair: (deviceId: number) => void;
  isPairing?: boolean;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onPair,
  isPairing = false,
}) => {
  const getStatusColor = () => {
    if (!device.isActive) return colors.error;
    if (!device.calibrationStatus) return colors.warning;
    if (device.isPaired) return colors.info;
    return colors.success;
  };

  const getStatusText = () => {
    if (!device.isActive) return "Inactive";
    if (!device.calibrationStatus) return "Not Calibrated";
    if (device.isPaired) return "In Use";
    return "Available";
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.deviceName}>{device.deviceName}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Firmware:</Text>
          <Text style={styles.value}>{device.firmwareVersion || "N/A"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Calibration Date:</Text>
          <Text style={styles.value}>
            {device.calibrationDate
              ? new Date(device.calibrationDate).toLocaleDateString()
              : "Not set"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Calibrated:</Text>
          <Text
            style={[
              styles.value,
              device.calibrationStatus ? styles.success : styles.error,
            ]}
          >
            {device.calibrationStatus ? "✓ Yes" : "✗ No"}
          </Text>
        </View>

        {device.calibrationCertificateNo && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Certificate:</Text>
            <Text style={styles.value}>{device.calibrationCertificateNo}</Text>
          </View>
        )}
      </View>

      {!device.isPaired && device.isActive && device.calibrationStatus && (
        <TouchableOpacity
          style={[styles.pairButton, isPairing && styles.pairButtonDisabled]}
          onPress={() => onPair(device.deviceId)}
          disabled={isPairing}
        >
          <Text style={styles.pairButtonText}>
            {isPairing ? "🔗 Pairing..." : "🔗 Pair Device"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deviceName: {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
  },
  details: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  value: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  success: {
    color: colors.success,
  },
  error: {
    color: colors.error,
  },
  pairButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  pairButtonDisabled: {
    opacity: 0.5,
  },
  pairButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
