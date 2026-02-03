import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Header } from "../../components/common/Header";
import { Loading } from "../../components/common/Loading";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { DeviceCard } from "../../components/device/DeviceCard";
import { PairedDeviceCard } from "../../components/device/PairedDeviceCard";
import { colors } from "../../styles/colors";
import { spacing, borderRadius } from "../../styles/spacing";
import iotDeviceApi from "../../api/iotDeviceApi";
import {
  IotDeviceListItemDto,
  IotDeviceResponseDto,
} from "../../models/IotDevice";
import Toast from "react-native-toast-message";
import BleDeviceService, { BleDevice } from "../../services/BleDeviceService";

interface MatchedDevice {
  bleDevice: BleDevice;
  dbDevice: IotDeviceListItemDto;
  isVerified: boolean;
}

interface PairDeviceScreenProps {
  navigation: any;
  route?: any;
}

export const PairDeviceScreen: React.FC<PairDeviceScreenProps> = ({
  navigation,
  route,
}) => {
  // Check for reconnect message from CreateChallanScreen
  const reconnectMessage = route?.params?.message;
  const isReconnect = route?.params?.reconnect;

  const [availableDbDevices, setAvailableDbDevices] = useState<
    IotDeviceListItemDto[]
  >([]);
  const [bleDevices, setBleDevices] = useState<BleDevice[]>([]);
  const [matchedDevices, setMatchedDevices] = useState<MatchedDevice[]>([]);
  const [pairedDevice, setPairedDevice] = useState<IotDeviceResponseDto | null>(
    null,
  );
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [loadingPaired, setLoadingPaired] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairingDeviceId, setPairingDeviceId] = useState<number | null>(null);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
  const [isUnpairing, setIsUnpairing] = useState<boolean>(false);
  const [hadActiveConnection, setHadActiveConnection] =
    useState<boolean>(false);

  // Show reconnect message if coming from CreateChallanScreen due to disconnection
  useEffect(() => {
    if (isReconnect && reconnectMessage) {
      Toast.show({
        type: "warning",
        text1: "🔌 Reconnection Required",
        text2: reconnectMessage,
        visibilityTime: 4000,
      });
    }
  }, [isReconnect, reconnectMessage]);

  // Reload paired device when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPairedDevice();
      loadAvailableDevicesFromDb();
      checkConnectionStatus();

      // Set up disconnection listener to auto-unpair when device disconnects
      const handleAutoUnpair = async () => {
        // Prevent multiple simultaneous unpair attempts
        if (isUnpairing) {
          console.log("⚠️ Already unpairing, skipping...");
          return;
        }

        // Only auto-unpair if we had an active connection before
        if (!hadActiveConnection) {
          console.log(
            "⚠️ No active connection was established, skipping auto-unpair",
          );
          return;
        }

        console.log("🔌 Device disconnected - auto-unpairing...");
        setIsUnpairing(true);
        setIsDeviceConnected(false);
        setHadActiveConnection(false);

        Toast.show({
          type: "warning",
          text1: "Device Disconnected",
          text2: "Bluetooth connection lost. Unpairing device...",
        });

        // Call unpair API to release device
        try {
          await iotDeviceApi.unpairDevice();
          setPairedDevice(null);
          await loadAvailableDevicesFromDb();
          Toast.show({
            type: "info",
            text1: "Device Unpaired",
            text2: "You can pair again when device is available",
          });
        } catch (error) {
          console.error("Auto-unpair error:", error);
        } finally {
          setIsUnpairing(false);
        }
      };

      BleDeviceService.setDisconnectionListener(handleAutoUnpair);

      // Periodically check connection status when device is paired (every 10 seconds)
      const connectionCheckInterval = setInterval(async () => {
        // Get current state values directly from API/BLE instead of relying on state
        try {
          const device = await iotDeviceApi.getPairedDevice();
          if (!device) {
            return; // No paired device, nothing to check
          }

          const wasConnected = isDeviceConnected;
          const bluetoothEnabled = await BleDeviceService.isBluetoothEnabled();

          await checkConnectionStatus();

          // Track if we ever had an active connection
          if (isDeviceConnected && bluetoothEnabled) {
            setHadActiveConnection(true);
          }

          // Only trigger auto-unpair if:
          // 1. We had a connection before (wasConnected = true)
          // 2. Bluetooth is still enabled (not just turned off)
          // 3. But device is now disconnected
          // 4. We have hadActiveConnection flag set
          if (
            wasConnected &&
            !isDeviceConnected &&
            bluetoothEnabled &&
            hadActiveConnection
          ) {
            console.log(
              "⚠️ Active connection lost while Bluetooth is on - auto-unpairing",
            );
            await handleAutoUnpair();
          }
        } catch (error) {
          // No paired device or error checking - skip this interval
          console.log("⚠️ No paired device or error checking connection");
        }
      }, 10000); // Fixed 10 second interval

      // Cleanup listener and interval when screen loses focus
      return () => {
        BleDeviceService.removeDisconnectionListener();
        clearInterval(connectionCheckInterval);
      };
    }, []), // Empty dependency array - only run on mount/unmount
  );

  const loadPairedDevice = async () => {
    try {
      setLoadingPaired(true);
      const device = await iotDeviceApi.getPairedDevice();
      setPairedDevice(device);
    } catch (error) {
      console.error("Error loading paired device:", error);
    } finally {
      setLoadingPaired(false);
    }
  };

  /**
   * Check if BLE device is actually connected
   */
  const checkConnectionStatus = async () => {
    try {
      const connected = await BleDeviceService.isConnected();
      const bluetoothEnabled = await BleDeviceService.isBluetoothEnabled();
      setIsDeviceConnected(connected && bluetoothEnabled);
      console.log(
        `🔌 Connection status: ${connected}, Bluetooth: ${bluetoothEnabled}`,
      );
    } catch (error) {
      console.error("Error checking connection:", error);
      setIsDeviceConnected(false);
    }
  };

  /**
   * Load available devices from database (for matching)
   */
  const loadAvailableDevicesFromDb = async () => {
    try {
      setError(null);
      const data = await iotDeviceApi.getAvailableDevices();
      setAvailableDbDevices(data);
      console.log(`📋 Loaded ${data.length} devices from database`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load devices from database",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Scan for Bluetooth devices and match with database
   */
  const scanForBluetoothDevices = async () => {
    try {
      setScanning(true);
      setError(null);
      setBleDevices([]);
      setMatchedDevices([]);

      console.log("🔍 Starting BLE scan...");
      Toast.show({
        type: "info",
        text1: "Scanning for IoT Devices",
        text2: "Looking for nearby devices...",
      });

      const foundDevices = await BleDeviceService.scanForDevices();
      setBleDevices(foundDevices);
      console.log(`📡 Found ${foundDevices.length} BLE devices`);

      // Match BLE devices with database devices by name
      const matched: MatchedDevice[] = [];
      for (const bleDevice of foundDevices) {
        const dbDevice = availableDbDevices.find(
          (db) => db.deviceName === bleDevice.name,
        );

        if (dbDevice) {
          console.log(
            `✅ Matched: ${bleDevice.name} with DB device #${dbDevice.deviceId}`,
          );
          matched.push({
            bleDevice,
            dbDevice,
            isVerified: false, // Will verify after connection
          });
        } else {
          console.log(`⚠️ BLE device ${bleDevice.name} not found in database`);
        }
      }

      setMatchedDevices(matched);

      if (matched.length === 0) {
        Toast.show({
          type: "warning",
          text1: "No Registered Devices Found",
          text2: "Found BLE devices but none are registered in the system",
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Devices Found",
          text2: `Found ${matched.length} registered device(s) nearby`,
        });
      }
    } catch (error: any) {
      console.error("❌ BLE scan error:", error);
      setError(
        "Bluetooth scan failed. Please enable Bluetooth and location services.",
      );
      Toast.show({
        type: "error",
        text1: "Scan Failed",
        text2: error.message || "Failed to scan for devices",
      });
    } finally {
      setScanning(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPairedDevice();
    await loadAvailableDevicesFromDb();
    await checkConnectionStatus();
    // Auto-scan if not paired
    if (!pairedDevice && availableDbDevices.length > 0) {
      await scanForBluetoothDevices();
    }
    setRefreshing(false);
  };

  /**
   * Reconnect to already paired device
   */
  const handleReconnect = async () => {
    if (!pairedDevice) return;

    try {
      setConnectingDevice(pairedDevice.deviceName);
      console.log(`🔗 Reconnecting to ${pairedDevice.deviceName}...`);

      Toast.show({
        type: "info",
        text1: "Reconnecting...",
        text2: "Establishing Bluetooth connection...",
      });

      // Check if Bluetooth is enabled
      const btEnabled = await BleDeviceService.isBluetoothEnabled();
      if (!btEnabled) {
        throw new Error("Please enable Bluetooth first");
      }

      // Scan for the device
      const devices = await BleDeviceService.scanForDevices();
      const targetDevice = devices.find(
        (d) => d.name === pairedDevice.deviceName,
      );

      if (!targetDevice) {
        throw new Error(
          "Device not found. Please ensure device is powered on and nearby.",
        );
      }

      // Connect to device
      await BleDeviceService.connect(targetDevice.id);

      // Verify connection
      const status = await BleDeviceService.getDeviceStatus(
        pairedDevice.deviceId,
      );
      if (status.device_id !== pairedDevice.deviceId) {
        throw new Error("Device ID mismatch");
      }

      setIsDeviceConnected(true);
      setHadActiveConnection(true);

      Toast.show({
        type: "success",
        text1: "Reconnected!",
        text2: "Device is now active",
      });
    } catch (error: any) {
      console.error("❌ Reconnection error:", error);
      Toast.show({
        type: "error",
        text1: "Reconnection Failed",
        text2: error.message || "Failed to reconnect to device",
      });
    } finally {
      setConnectingDevice(null);
    }
  };

  const handleUnpair = async () => {
    try {
      setLoading(true);
      console.log("Starting unpair process...");

      // Disconnect BLE if connected
      if (BleDeviceService.isConnected()) {
        await BleDeviceService.disconnect();
      }

      const success = await iotDeviceApi.unpairDevice();
      console.log("Unpair success:", success);

      if (success) {
        Toast.show({
          type: "success",
          text1: "Device Unpaired",
          text2: "Device is now available for other officers",
        });
        setPairedDevice(null);
        setIsDeviceConnected(false);
        setHadActiveConnection(false);
        await loadAvailableDevicesFromDb();
        // Automatically scan for devices after unpairing
        if (availableDbDevices.length > 0) {
          await scanForBluetoothDevices();
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Unpair Failed",
          text2: "Unexpected response from server",
        });
      }
    } catch (error: any) {
      console.error("Unpair error:", error);
      Toast.show({
        type: "error",
        text1: "Unpair Failed",
        text2: error.response?.data?.message || "Failed to unpair device",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Connect to BLE device, verify it, then pair in backend
   */
  const handlePairDevice = async (matched: MatchedDevice) => {
    try {
      setPairingDeviceId(matched.dbDevice.deviceId);
      setConnectingDevice(matched.bleDevice.id);

      console.log(`🔗 Connecting to ${matched.bleDevice.name}...`);
      Toast.show({
        type: "info",
        text1: "Connecting to Device",
        text2: `Establishing Bluetooth connection...`,
      });

      // Step 1: Connect via Bluetooth
      await BleDeviceService.connect(matched.bleDevice.id);
      console.log("✅ BLE connection established");

      // Step 2: Verify device (get device status to confirm it's the right device)
      Toast.show({
        type: "info",
        text1: "Verifying Device",
        text2: "Reading device information...",
      });

      const deviceStatus = await BleDeviceService.getDeviceStatus(
        matched.dbDevice.deviceId,
      );
      console.log("📋 Device status:", deviceStatus);

      // Verify device ID matches
      if (deviceStatus.device_id !== matched.dbDevice.deviceId) {
        throw new Error(
          `Device ID mismatch: Expected ${matched.dbDevice.deviceId}, got ${deviceStatus.device_id}`,
        );
      }

      console.log("✅ Device verified successfully");

      // Step 3: Pair with backend
      Toast.show({
        type: "info",
        text1: "Pairing Device",
        text2: "Registering with server...",
      });

      const message = await iotDeviceApi.pairDevice({
        deviceId: matched.dbDevice.deviceId,
      });

      Toast.show({
        type: "success",
        text1: "Device Paired Successfully!",
        text2: "You can now generate emission reports",
        visibilityTime: 3000,
      });

      // Mark that we now have an active BLE connection
      setHadActiveConnection(true);
      setIsDeviceConnected(true);

      // Clear pairing state before navigation
      setPairingDeviceId(null);
      setConnectingDevice(null);

      // Navigate to dashboard after pairing
      setTimeout(() => {
        navigation.navigate("Dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("❌ Pairing error:", error);

      // Disconnect on error
      if (BleDeviceService.isConnected()) {
        await BleDeviceService.disconnect();
      }

      Toast.show({
        type: "error",
        text1: "Pairing Failed",
        text2: error.message || "Could not pair device",
      });
      setPairingDeviceId(null);
      setConnectingDevice(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Pair IoT Device"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <Loading message="Loading devices..." fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Pair IoT Device"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {loadingPaired ? (
        <View style={styles.loadingContainer}>
          <Loading message="Checking paired device..." />
        </View>
      ) : pairedDevice ? (
        <View style={styles.pairedContainer}>
          <PairedDeviceCard
            device={pairedDevice}
            onUnpair={handleUnpair}
            isConnected={isDeviceConnected}
            onReconnect={handleReconnect}
            isReconnecting={connectingDevice === pairedDevice.deviceName}
          />
        </View>
      ) : (
        <View style={styles.scanContainer}>
          {/* Scan Button */}
          <TouchableOpacity
            style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
            onPress={scanForBluetoothDevices}
            disabled={scanning || loading}
          >
            <Text style={styles.scanButtonText}>
              {scanning ? "🔍 Scanning..." : "📡 Scan for Devices"}
            </Text>
          </TouchableOpacity>

          {/* Instructions */}
          {matchedDevices.length === 0 && !scanning && !error && (
            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>How to Pair:</Text>
              <Text style={styles.instructionsText}>
                1. Turn on your IoT device{"\n"}
                2. Make sure Bluetooth is enabled{"\n"}
                3. Tap "Scan for Devices"{"\n"}
                4. Select your device from the list
              </Text>
            </View>
          )}

          {/* Scanning Indicator */}
          {scanning && (
            <View style={styles.scanningContainer}>
              <Loading message="Scanning for nearby devices..." />
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <ErrorMessage message={error} onRetry={scanForBluetoothDevices} />
            </View>
          )}

          {/* Matched Devices List */}
          {!scanning && matchedDevices.length > 0 && (
            <ScrollView
              style={styles.devicesList}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              showsVerticalScrollIndicator={false}
            >
              {matchedDevices.map((item) => (
                <View key={item.bleDevice.id} style={styles.matchedDeviceCard}>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{item.bleDevice.name}</Text>
                    <Text style={styles.deviceDetails}>
                      Device ID: {item.dbDevice.deviceId}
                    </Text>
                    <Text style={styles.deviceDetails}>
                      Firmware: {item.dbDevice.firmwareVersion}
                    </Text>
                    <Text style={styles.deviceDetails}>
                      Signal: {item.bleDevice.rssi} dBm
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.pairButton,
                      (pairingDeviceId === item.dbDevice.deviceId ||
                        connectingDevice === item.bleDevice.id) &&
                        styles.pairButtonDisabled,
                    ]}
                    onPress={() => handlePairDevice(item)}
                    disabled={
                      pairingDeviceId !== null || connectingDevice !== null
                    }
                  >
                    <Text style={styles.pairButtonText}>
                      {pairingDeviceId === item.dbDevice.deviceId ||
                      connectingDevice === item.bleDevice.id
                        ? "Pairing..."
                        : "Pair"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pairedContainer: {
    padding: spacing.md,
  },
  scanContainer: {
    flex: 1,
  },
  scanButton: {
    backgroundColor: colors.primary[600],
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    elevation: 4,
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  scanButtonDisabled: {
    backgroundColor: colors.text.disabled,
    elevation: 1,
    shadowOpacity: 0.1,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  instructions: {
    backgroundColor: colors.background.elevated,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[600],
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  instructionsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.sm + 2,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    fontWeight: "500",
  },
  scanningContainer: {
    padding: spacing.xl,
  },
  errorContainer: {
    padding: spacing.md,
  },
  devicesList: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  matchedDeviceCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  deviceInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  deviceDetails: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 3,
    fontWeight: "500",
  },
  pairButton: {
    backgroundColor: colors.success[500],
    paddingHorizontal: spacing.lg + 2,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.lg,
    minWidth: 90,
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.success[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  pairButtonDisabled: {
    backgroundColor: colors.text.disabled,
    elevation: 0,
    shadowOpacity: 0,
  },
  pairButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
