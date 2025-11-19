import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { IotDeviceResponseDto } from "../../models/IotDevice";
import { colors } from "../../styles/colors";

interface PairedDeviceCardProps {
  device: IotDeviceResponseDto;
  onUnpair: () => void;
}

export const PairedDeviceCard: React.FC<PairedDeviceCardProps> = ({
  device,
  onUnpair,
}) => {
  console.log("PairedDeviceCard rendered with device:", device.deviceName);

  const handleUnpair = () => {
    console.log("PairedDeviceCard: handleUnpair called!");
    console.log("Device:", device.deviceName);
    console.log("onUnpair prop:", typeof onUnpair);

    // For web, use window.confirm; for mobile, use Alert.alert
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to unpair from "${device.deviceName}"?`
      );
      if (confirmed) {
        console.log("User confirmed unpair (web)!");
        onUnpair();
      } else {
        console.log("User cancelled unpair (web)");
      }
    } else {
      Alert.alert(
        "Unpair Device",
        `Are you sure you want to unpair from "${device.deviceName}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Unpair",
            style: "destructive",
            onPress: () => {
              console.log("User confirmed unpair (mobile)!");
              onUnpair();
            },
          },
        ]
      );
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Currently Paired Device</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ACTIVE</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Device Name:</Text>
          <Text style={styles.value}>{device.deviceName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Device ID:</Text>
          <Text style={styles.value}>#{device.deviceId}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Firmware:</Text>
          <Text style={styles.value}>{device.firmwareVersion}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Calibration:</Text>
          <Text
            style={[
              styles.value,
              device.calibrationStatus ? styles.valid : styles.invalid,
            ]}
          >
            {device.calibrationStatus ? "✓ Valid" : "✗ Not Calibrated"}
          </Text>
        </View>

        {device.calibrationDate && (
          <View style={styles.row}>
            <Text style={styles.label}>Calibration Date:</Text>
            <Text style={styles.value}>
              {formatDate(device.calibrationDate)}
            </Text>
          </View>
        )}

        {device.calibrationCertificateNo && (
          <View style={styles.row}>
            <Text style={styles.label}>Certificate No:</Text>
            <Text style={styles.value}>{device.calibrationCertificateNo}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Paired At:</Text>
          <Text style={styles.value}>
            {formatDateTime(device.pairingDateTime)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.unpairButton}
        activeOpacity={0.7}
        onPress={() => {
          console.log("TouchableOpacity pressed!");
          handleUnpair();
        }}
        testID="unpair-button"
      >
        <Text style={styles.unpairButtonText}>Unpair Device</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  valid: {
    color: colors.success,
  },
  invalid: {
    color: colors.error,
  },
  unpairButton: {
    backgroundColor: colors.error,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    width: "100%",
  },
  unpairButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
