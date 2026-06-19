import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Polyline } from "react-native-svg";
import Toast from "react-native-toast-message";
import { Header } from "../../components/common/Header";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import iotDeviceApi from "../../api/iotDeviceApi";
import BleDeviceService, {
  RealtimeSensorData,
} from "../../services/BleDeviceService";
import { IotDeviceResponseDto } from "../../models/IotDevice";
import { useAuth } from "../../contexts/AuthContext";

interface LiveDetectionScreenProps {
  navigation: any;
}

const MAX_POINTS = 30;

const pushHistory = (
  value: number | null | undefined,
  setter: React.Dispatch<React.SetStateAction<number[]>>,
) => {
  if (typeof value !== "number" || !isFinite(value)) {
    return;
  }

  setter((prev) => {
    const next = [...prev, value];
    if (next.length > MAX_POINTS) {
      next.shift();
    }
    return next;
  });
};

const formatValue = (value: number | null, precision: number) => {
  if (typeof value !== "number" || !isFinite(value)) {
    return "--";
  }
  return value.toFixed(precision);
};

const Sparkline: React.FC<{ data: number[]; color: string }> = ({
  data,
  color,
}) => {
  if (data.length < 2) {
    return <View style={styles.sparklineEmpty} />;
  }

  const width = 120;
  const height = 40;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2} />
    </Svg>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: number | null;
  unit: string;
  color: string;
  history: number[];
  precision?: number;
}> = ({ label, value, unit, color, history, precision = 1 }) => {
  return (
    <Card style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={[styles.metricDot, { backgroundColor: color }]} />
      </View>
      <View style={styles.metricBody}>
        <Text style={styles.metricValue}>{formatValue(value, precision)}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
      <Sparkline data={history} color={color} />
    </Card>
  );
};

export const LiveDetectionScreen: React.FC<LiveDetectionScreenProps> = ({
  navigation,
}) => {
  const { userDetails } = useAuth();
  const [pairedDevice, setPairedDevice] = useState<IotDeviceResponseDto | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const [soundLevel, setSoundLevel] = useState<number | null>(null);
  const [co, setCo] = useState<number | null>(null);
  const [co2, setCo2] = useState<number | null>(null);
  const [hc, setHc] = useState<number | null>(null);
  const [nox, setNox] = useState<number | null>(null);

  const [soundHistory, setSoundHistory] = useState<number[]>([]);
  const [coHistory, setCoHistory] = useState<number[]>([]);
  const [co2History, setCo2History] = useState<number[]>([]);
  const [hcHistory, setHcHistory] = useState<number[]>([]);
  const [noxHistory, setNoxHistory] = useState<number[]>([]);

  const isStreamingRef = useRef(isStreaming);
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  const loadDeviceStatus = useCallback(async () => {
    try {
      const device = await iotDeviceApi.getPairedDevice();
      setPairedDevice(device);

      if (!device) {
        setIsConnected(false);
        return;
      }

      const connected = await BleDeviceService.isConnected();
      const bluetoothEnabled = await BleDeviceService.isBluetoothEnabled();
      const nextConnected = connected && bluetoothEnabled;

      if (!nextConnected && isStreamingRef.current) {
        setIsStreaming(false);
        Toast.show({
          type: "error",
          text1: "Connection lost",
          text2: "Realtime detection stopped",
        });
      }

      setIsConnected(nextConnected);
    } catch (error) {
      console.error("Error loading detection status:", error);
      setIsConnected(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDeviceStatus();
      const interval = setInterval(loadDeviceStatus, 5000);
      return () => clearInterval(interval);
    }, [loadDeviceStatus]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDeviceStatus();
    setRefreshing(false);
  };

  const handleRealtimeData = useCallback((payload: RealtimeSensorData) => {
    if (!isStreamingRef.current || !payload.data) {
      return;
    }

    const { sound_level_dba, co, co2, hc, nox } = payload.data;

    if (typeof sound_level_dba === "number") {
      setSoundLevel(sound_level_dba);
      pushHistory(sound_level_dba, setSoundHistory);
    }
    if (typeof co === "number") {
      setCo(co);
      pushHistory(co, setCoHistory);
    }
    if (typeof co2 === "number") {
      setCo2(co2);
      pushHistory(co2, setCo2History);
    }
    if (typeof hc === "number") {
      setHc(hc);
      pushHistory(hc, setHcHistory);
    }
    if (typeof nox === "number") {
      setNox(nox);
      pushHistory(nox, setNoxHistory);
    }

    setLastUpdatedAt(new Date());
  }, []);

  useEffect(() => {
    BleDeviceService.setRealtimeDataCallback(handleRealtimeData);
    return () => {
      BleDeviceService.removeRealtimeDataCallback();
    };
  }, [handleRealtimeData]);

  useEffect(() => {
    return () => {
      if (isStreamingRef.current && pairedDevice) {
        BleDeviceService.stopRealtimeStream(pairedDevice.deviceId).catch(() => {
          return;
        });
      }
    };
  }, [pairedDevice]);

  const handleToggleStream = async () => {
    if (!pairedDevice) {
      Toast.show({
        type: "error",
        text1: "No paired device",
        text2: "Pair a device before starting detection",
      });
      return;
    }

    if (!isConnected) {
      Toast.show({
        type: "error",
        text1: "Device not connected",
        text2: "Reconnect the IoT device to start detection",
      });
      return;
    }

    setStreamLoading(true);

    try {
      if (isStreaming) {
        await BleDeviceService.stopRealtimeStream(pairedDevice.deviceId);
        setIsStreaming(false);
      } else {
        setSoundLevel(null);
        setCo(null);
        setCo2(null);
        setHc(null);
        setNox(null);
        setSoundHistory([]);
        setCoHistory([]);
        setCo2History([]);
        setHcHistory([]);
        setNoxHistory([]);
        setLastUpdatedAt(null);
        await BleDeviceService.startRealtimeStream(
          pairedDevice.deviceId,
          userDetails?.officerId,
        );
        setIsStreaming(true);
      }
    } catch (error: any) {
      console.error("Realtime stream error:", error);
      Toast.show({
        type: "error",
        text1: "Stream error",
        text2: error.message || "Unable to toggle realtime stream",
      });
      setIsStreaming(false);
    } finally {
      setStreamLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Live Detection" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>Paired Device</Text>
              <Text style={styles.statusValue}>
                {pairedDevice?.deviceName || "Not paired"}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isConnected
                  ? styles.statusBadgeConnected
                  : styles.statusBadgeOff,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isConnected
                    ? styles.statusBadgeTextConnected
                    : styles.statusBadgeTextOff,
                ]}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusMeta}>
              {lastUpdatedAt
                ? `Last update: ${lastUpdatedAt.toLocaleTimeString()}`
                : "No realtime data yet"}
            </Text>
          </View>
          <View style={styles.actionRow}>
            <Button
              title={isStreaming ? "Stop Detection" : "Start Detection"}
              onPress={handleToggleStream}
              variant={isStreaming ? "danger" : "success"}
              loading={streamLoading}
              disabled={!pairedDevice || !isConnected}
              fullWidth
            />
          </View>
          {!pairedDevice && (
            <View style={styles.actionRow}>
              <Button
                title="Pair Device"
                onPress={() => navigation.navigate("PairDevice")}
                variant="outline"
                fullWidth
              />
            </View>
          )}
          {pairedDevice && !isConnected && (
            <View style={styles.actionRow}>
              <Button
                title="Reconnect Device"
                onPress={() => navigation.navigate("PairDevice")}
                variant="outline"
                fullWidth
              />
            </View>
          )}
        </Card>

        <View style={styles.metricsGrid}>
          <MetricCard
            label="Sound"
            value={soundLevel}
            unit="dBA"
            color={colors.primary[600]}
            history={soundHistory}
            precision={1}
          />
          <MetricCard
            label="CO"
            value={co}
            unit="ppm"
            color={colors.error[500]}
            history={coHistory}
            precision={2}
          />
          <MetricCard
            label="CO2"
            value={co2}
            unit="ppm"
            color={colors.info[500]}
            history={co2History}
            precision={2}
          />
          <MetricCard
            label="HC"
            value={hc}
            unit="ppm"
            color={colors.warning[500]}
            history={hcHistory}
            precision={2}
          />
          <MetricCard
            label="NOx"
            value={nox}
            unit="ppm"
            color={colors.accent[500]}
            history={noxHistory}
            precision={2}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  statusCard: {
    marginBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statusValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "700",
  },
  statusMeta: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgeConnected: {
    backgroundColor: colors.success[50],
  },
  statusBadgeOff: {
    backgroundColor: colors.error[50],
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadgeTextConnected: {
    color: colors.success[700],
  },
  statusBadgeTextOff: {
    color: colors.error[700],
  },
  actionRow: {
    marginTop: spacing.sm,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    marginBottom: spacing.md,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  metricDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricBody: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.primary,
  },
  metricUnit: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
    marginLeft: spacing.xs,
  },
  sparklineEmpty: {
    height: 40,
  },
});
