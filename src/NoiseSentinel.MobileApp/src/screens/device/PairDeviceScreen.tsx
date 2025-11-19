import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Header } from "../../components/common/Header";
import { Loading } from "../../components/common/Loading";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { DeviceCard } from "../../components/device/DeviceCard";
import { PairedDeviceCard } from "../../components/device/PairedDeviceCard";
import { colors } from "../../styles/colors";
import { spacing } from "../../styles/spacing";
import iotDeviceApi from "../../api/iotDeviceApi";
import {
  IotDeviceListItemDto,
  IotDeviceResponseDto,
} from "../../models/IotDevice";
import Toast from "react-native-toast-message";

interface PairDeviceScreenProps {
  navigation: any;
}

export const PairDeviceScreen: React.FC<PairDeviceScreenProps> = ({
  navigation,
}) => {
  const [devices, setDevices] = useState<IotDeviceListItemDto[]>([]);
  const [pairedDevice, setPairedDevice] = useState<IotDeviceResponseDto | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [loadingPaired, setLoadingPaired] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairingDeviceId, setPairingDeviceId] = useState<number | null>(null);

  // Reload paired device when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPairedDevice();
      loadDevices();
    }, [])
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

  const loadDevices = async () => {
    try {
      setError(null);
      const data = await iotDeviceApi.getAvailableDevices();
      setDevices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load devices");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPairedDevice();
    await loadDevices();
    setRefreshing(false);
  };

  const handleUnpair = async () => {
    try {
      setLoading(true);
      console.log("Starting unpair process...");
      const success = await iotDeviceApi.unpairDevice();
      console.log("Unpair success:", success);

      if (success) {
        Toast.show({
          type: "success",
          text1: "Device Unpaired",
          text2: "Device is now available for other officers",
        });
        setPairedDevice(null);
        await loadDevices(); // Refresh available devices
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

  const handlePairDevice = async (deviceId: number) => {
    try {
      setPairingDeviceId(deviceId);
      const message = await iotDeviceApi.pairDevice({ deviceId });

      Toast.show({
        type: "success",
        text1: "Device Paired Successfully!",
        text2: "You can now generate emission reports",
        visibilityTime: 2000,
      });

      // Clear pairing state before navigation
      setPairingDeviceId(null);

      // Navigate to dashboard after pairing
      setTimeout(() => {
        navigation.navigate("Dashboard");
      }, 500);

      // Don't call loadDevices - let it refresh when user comes back
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Pairing Failed",
        text2: error.response?.data?.message || "Could not pair device",
      });
      setPairingDeviceId(null);
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
          <PairedDeviceCard device={pairedDevice} onUnpair={handleUnpair} />
        </View>
      ) : (
        <FlatList
          data={devices}
          renderItem={({ item }) => (
            <DeviceCard
              device={item}
              onPair={handlePairDevice}
              isPairing={pairingDeviceId === item.deviceId}
            />
          )}
          keyExtractor={(item) => item.deviceId.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            error ? (
              <ErrorMessage message={error} onRetry={loadDevices} />
            ) : (
              <ErrorMessage message="No devices available for pairing" />
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pairedContainer: {
    padding: spacing.md,
  },
  listContent: {
    padding: spacing.md,
  },
});
