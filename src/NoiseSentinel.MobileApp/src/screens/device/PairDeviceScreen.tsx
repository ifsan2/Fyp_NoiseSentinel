import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { DeviceCard } from '../../components/device/DeviceCard';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import iotDeviceApi from '../../api/iotDeviceApi';
import { IotDeviceListItemDto } from '../../models/IotDevice';
import Toast from 'react-native-toast-message';

interface PairDeviceScreenProps {
  navigation: any;
}

export const PairDeviceScreen: React.FC<PairDeviceScreenProps> = ({ navigation }) => {
  const [devices, setDevices] = useState<IotDeviceListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairingDeviceId, setPairingDeviceId] = useState<number | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setError(null);
      const data = await iotDeviceApi.getAvailableDevices();
      setDevices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDevices();
    setRefreshing(false);
  };

  const handlePairDevice = async (deviceId: number) => {
    try {
      setPairingDeviceId(deviceId);
      const message = await iotDeviceApi.pairDevice({ deviceId });

      Toast.show({
        type: 'success',
        text1: 'Device Paired!',
        text2: message,
      });

      // Refresh devices list
      await loadDevices();

      // Navigate back or to emission report
      setTimeout(() => {
        navigation.navigate('CreateEmissionReport', { deviceId });
      }, 1500);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Pairing Failed',
        text2: error.response?.data?.message || 'Could not pair device',
      });
    } finally {
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
  },
});