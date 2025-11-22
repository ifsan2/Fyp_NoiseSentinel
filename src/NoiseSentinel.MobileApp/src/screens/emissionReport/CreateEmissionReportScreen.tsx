import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Scan } from "lucide-react-native";
import { Header } from "../../components/common/Header";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { colors } from "../../styles/colors";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import emissionReportApi from "../../api/emissionReportApi";
import iotDeviceApi from "../../api/iotDeviceApi";
import { CreateEmissionReportDto } from "../../models/EmissionReport";
import { SOUND_THRESHOLD } from "../../utils/constants";
import Toast from "react-native-toast-message";

interface CreateEmissionReportScreenProps {
  navigation: any;
  route: any;
}

export const CreateEmissionReportScreen: React.FC<
  CreateEmissionReportScreenProps
> = ({ navigation, route }) => {
  const [pairedDeviceId, setPairedDeviceId] = useState<number | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [soundLevel, setSoundLevel] = useState("");
  const [co, setCo] = useState("");
  const [co2, setCo2] = useState("");
  const [hc, setHc] = useState("");
  const [nox, setNox] = useState("");
  const [mlClassification, setMlClassification] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDevice, setLoadingDevice] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    loadPairedDevice();
  }, []);

  const loadPairedDevice = async () => {
    try {
      setLoadingDevice(true);
      const device = await iotDeviceApi.getPairedDevice();
      if (device) {
        setPairedDeviceId(device.deviceId);
        setDeviceName(device.deviceName);
      } else {
        Toast.show({
          type: "error",
          text1: "No Device Paired",
          text2: "Please pair with a device first",
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error loading paired device:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load paired device",
      });
      navigation.goBack();
    } finally {
      setLoadingDevice(false);
    }
  };

  const handleScan = () => {
    // Simulate scanning and fill with dummy data
    setSoundLevel("92.5");
    setCo("2.3");
    setCo2("14.7");
    setHc("180");
    setNox("850");
    setMlClassification("Modified Silencer Detected");
    setScanned(true);

    Toast.show({
      type: "success",
      text1: "Scan Complete",
      text2: "Emission data captured successfully",
    });
  };

  const validate = (): boolean => {
    const newErrors: any = {};

    if (!pairedDeviceId) {
      newErrors.deviceId = "Device ID is required";
    }

    if (!soundLevel) {
      newErrors.soundLevel = "Sound level is required";
    } else {
      const level = parseFloat(soundLevel);
      if (isNaN(level) || level < 0 || level > 200) {
        newErrors.soundLevel = "Sound level must be between 0 and 200 dBA";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const data: CreateEmissionReportDto = {
        deviceId: pairedDeviceId!,
        soundLevelDBa: parseFloat(soundLevel),
        testDateTime: new Date().toISOString(),
        co: co ? parseFloat(co) : undefined,
        co2: co2 ? parseFloat(co2) : undefined,
        hc: hc ? parseFloat(hc) : undefined,
        nox: nox ? parseFloat(nox) : undefined,
        mlClassification: mlClassification || undefined,
      };

      const response = await emissionReportApi.createEmissionReport(data);

      Toast.show({
        type: "success",
        text1: "Report Generated!",
        text2: response.isViolation
          ? `⚠️ Violation Detected! (${response.soundLevelDBa} dBA)`
          : `✓ No Violation (${response.soundLevelDBa} dBA)`,
      });

      // Navigate to create challan if violation detected
      if (response.isViolation) {
        setTimeout(() => {
          navigation.navigate("CreateChallan", {
            emissionReportId: response.emissionReportId,
          });
        }, 2000);
      } else {
        navigation.goBack();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to create report",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSoundLevelColor = () => {
    const level = parseFloat(soundLevel);
    if (isNaN(level)) return colors.text.secondary;
    return level > SOUND_THRESHOLD ? colors.error[500] : colors.success[500];
  };

  const getSoundLevelStatus = () => {
    const level = parseFloat(soundLevel);
    if (isNaN(level)) return "";
    return level > SOUND_THRESHOLD
      ? `⚠️ VIOLATION (Legal limit: ${SOUND_THRESHOLD} dBA)`
      : `✓ Within Legal Limit`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header
        title="Generate Report"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {loadingDevice ? (
        <View style={styles.loadingContainer}>
          <Text>Loading paired device...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Device Info - Always show paired device */}
          <Card style={styles.deviceCard} variant="outlined">
            <Text style={styles.deviceLabel}>Paired Device:</Text>
            <Text style={styles.deviceValue}>
              🔗 {deviceName} (ID: {pairedDeviceId})
            </Text>
            <Text style={styles.deviceHint}>
              Device ID is fixed for this report
            </Text>
          </Card>

          {/* Scan Button */}
          <Card>
            <View style={styles.sectionTitleContainer}>
              <Scan size={20} color={colors.primary[600]} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Scan Vehicle Emissions</Text>
            </View>
            <Button
              title={scanned ? "✓ Scanned - Data Captured" : "🔍 Start Scan"}
              onPress={handleScan}
              variant={scanned ? "success" : "primary"}
              disabled={scanned}
              fullWidth
              style={styles.scanButton}
            />
            {scanned && (
              <Text style={styles.scanNote}>
                ℹ️ Scanned data is locked and cannot be modified
              </Text>
            )}
          </Card>

          {/* Required Fields */}
          <Card>
            <Text style={styles.sectionTitle}>📊 Emission Readings</Text>

            <Input
              label="Sound Level (dBA)"
              placeholder="Click 'Start Scan' to capture"
              value={soundLevel}
              onChangeText={setSoundLevel}
              error={errors.soundLevel}
              keyboardType="decimal-pad"
              required
              editable={!scanned}
              helperText={`Legal limit: ${SOUND_THRESHOLD} dBA`}
            />

            {soundLevel && !errors.soundLevel && (
              <View style={styles.soundStatus}>
                <Text
                  style={[
                    styles.soundStatusText,
                    { color: getSoundLevelColor() },
                  ]}
                >
                  {getSoundLevelStatus()}
                </Text>
              </View>
            )}
          </Card>

          {/* Emission Readings - Locked after scan */}
          <Card>
            <Text style={styles.sectionTitle}>🧪 Emission Readings</Text>

            <Input
              label="CO (Carbon Monoxide)"
              placeholder="Click 'Start Scan' to capture"
              value={co}
              onChangeText={setCo}
              keyboardType="decimal-pad"
              editable={!scanned}
            />

            <Input
              label="CO2 (Carbon Dioxide)"
              placeholder="Click 'Start Scan' to capture"
              value={co2}
              onChangeText={setCo2}
              keyboardType="decimal-pad"
              editable={!scanned}
            />

            <Input
              label="HC (Hydrocarbons)"
              placeholder="Click 'Start Scan' to capture"
              value={hc}
              onChangeText={setHc}
              keyboardType="decimal-pad"
              editable={!scanned}
            />

            <Input
              label="NOx (Nitrogen Oxides)"
              placeholder="Click 'Start Scan' to capture"
              value={nox}
              onChangeText={setNox}
              keyboardType="decimal-pad"
              editable={!scanned}
            />

            <Input
              label="ML Classification"
              placeholder="Click 'Start Scan' to capture"
              value={mlClassification}
              onChangeText={setMlClassification}
              multiline
              numberOfLines={2}
              editable={!scanned}
            />
          </Card>

          <Button
            title={loading ? "Generating..." : "Generate Report"}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !scanned}
            fullWidth
            style={styles.submitButton}
          />
        </ScrollView>
      )}
    </KeyboardAvoidingView>
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
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  deviceCard: {
    marginBottom: spacing.md,
  },
  deviceLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  deviceValue: {
    ...typography.h4,
    color: colors.primary[500],
    marginBottom: spacing.xs,
  },
  deviceHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  scanButton: {
    marginBottom: spacing.sm,
  },
  scanNote: {
    ...typography.bodySmall,
    color: colors.info[600],
    textAlign: "center",
    marginTop: spacing.sm,
  },
  soundStatus: {
    backgroundColor: colors.gray100,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginTop: spacing.sm,
  },
  soundStatusText: {
    ...typography.body,
    fontWeight: "700",
    textAlign: "center",
  },
  submitButton: {
    marginVertical: spacing.lg,
  },
});


