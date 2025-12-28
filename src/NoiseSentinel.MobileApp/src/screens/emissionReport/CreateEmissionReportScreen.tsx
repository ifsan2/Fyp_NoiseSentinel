import { Scan } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import emissionReportApi from "../../api/emissionReportApi";
import iotDeviceApi from "../../api/iotDeviceApi";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Header } from "../../components/common/Header";
import { Input } from "../../components/common/Input";
import { CreateEmissionReportDto } from "../../models/EmissionReport";
import { colors } from "../../styles/colors";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { SOUND_THRESHOLD } from "../../utils/constants";

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
          <Card style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
              <View style={styles.deviceIconContainer}>
                <Text style={styles.deviceIcon}>📡</Text>
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceLabel}>Paired Device</Text>
                <Text style={styles.deviceValue}>
                  {deviceName}
                </Text>
                <Text style={styles.deviceId}>ID: {pairedDeviceId}</Text>
              </View>
            </View>
            <View style={styles.deviceBadge}>
              <Text style={styles.deviceBadgeText}>🔒 Fixed for Report</Text>
            </View>
          </Card>

          {/* Scan Button */}
          <Card style={styles.scanCard}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.iconBadge}>
                <Scan size={18} color={colors.white} strokeWidth={2.5} />
              </View>
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
              <View style={styles.scanSuccessBadge}>
                <Text style={styles.scanNote}>
                  ✓ Scanned data is locked and cannot be modified
                </Text>
              </View>
            )}
          </Card>

          {/* Required Fields */}
          <Card>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.iconBadge, styles.soundIconBadge]}>
                <Text style={styles.iconEmoji}>📊</Text>
              </View>
              <Text style={styles.sectionTitle}>Sound Level</Text>
            </View>

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
              <View style={[
                styles.soundStatus,
                parseFloat(soundLevel) > SOUND_THRESHOLD ? styles.soundStatusViolation : styles.soundStatusSafe
              ]}>
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
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.iconBadge, styles.emissionIconBadge]}>
                <Text style={styles.iconEmoji}>🧪</Text>
              </View>
              <Text style={styles.sectionTitle}>Emission Readings</Text>
            </View>

            {/* Table Header */}
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.parameterColumn]}>
                  Parameter
                </Text>
                <Text style={[styles.tableHeaderText, styles.valueColumn]}>
                  Value
                </Text>
              </View>

              {/* Table Rows */}
              <View style={[styles.tableRow, styles.tableRowEven]}>
                <View style={[styles.tableCellContainer, styles.parameterColumn]}>
                  <Text style={styles.tableCellLabel}>CO</Text>
                  <Text style={styles.tableCellSublabel}>Carbon Monoxide</Text>
                </View>
                <View style={[styles.valueColumn, styles.tableInputContainer]}>
                  <Input
                    placeholder={scanned ? "-" : "Scan"}
                    value={co}
                    onChangeText={setCo}
                    keyboardType="decimal-pad"
                    editable={!scanned}
                    style={styles.tableInput}
                  />
                </View>
              </View>

              <View style={styles.tableRow}>
                <View style={[styles.tableCellContainer, styles.parameterColumn]}>
                  <Text style={styles.tableCellLabel}>CO2</Text>
                  <Text style={styles.tableCellSublabel}>Carbon Dioxide</Text>
                </View>
                <View style={[styles.valueColumn, styles.tableInputContainer]}>
                  <Input
                    placeholder={scanned ? "-" : "Scan"}
                    value={co2}
                    onChangeText={setCo2}
                    keyboardType="decimal-pad"
                    editable={!scanned}
                    style={styles.tableInput}
                  />
                </View>
              </View>

              <View style={[styles.tableRow, styles.tableRowEven]}>
                <View style={[styles.tableCellContainer, styles.parameterColumn]}>
                  <Text style={styles.tableCellLabel}>HC</Text>
                  <Text style={styles.tableCellSublabel}>Hydrocarbons</Text>
                </View>
                <View style={[styles.valueColumn, styles.tableInputContainer]}>
                  <Input
                    placeholder={scanned ? "-" : "Scan"}
                    value={hc}
                    onChangeText={setHc}
                    keyboardType="decimal-pad"
                    editable={!scanned}
                    style={styles.tableInput}
                  />
                </View>
              </View>

              <View style={styles.tableRow}>
                <View style={[styles.tableCellContainer, styles.parameterColumn]}>
                  <Text style={styles.tableCellLabel}>NOx</Text>
                  <Text style={styles.tableCellSublabel}>Nitrogen Oxides</Text>
                </View>
                <View style={[styles.valueColumn, styles.tableInputContainer]}>
                  <Input
                    placeholder={scanned ? "-" : "Scan"}
                    value={nox}
                    onChangeText={setNox}
                    keyboardType="decimal-pad"
                    editable={!scanned}
                    style={styles.tableInput}
                  />
                </View>
              </View>

              <View style={[styles.tableRow, styles.tableRowEven, styles.lastRow]}>
                <View style={[styles.tableCellContainer, styles.parameterColumn]}>
                  <Text style={styles.tableCellLabel}>ML Classification</Text>
                  <Text style={styles.tableCellSublabel}>Auto-detected</Text>
                </View>
                <View style={[styles.valueColumn, styles.tableInputContainer]}>
                  <Input
                    placeholder={scanned ? "-" : "Scan"}
                    value={mlClassification}
                    onChangeText={setMlClassification}
                    editable={!scanned}
                    style={styles.tableInput}
                  />
                </View>
              </View>
            </View>
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
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  deviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  deviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  deviceIcon: {
    fontSize: 24,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceLabel: {
    ...typography.bodySmall,
    color: colors.primary[700],
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs / 2,
  },
  deviceValue: {
    ...typography.h4,
    color: colors.primary[900],
    fontWeight: "700",
    marginBottom: spacing.xs / 2,
  },
  deviceId: {
    ...typography.bodySmall,
    color: colors.primary[600],
    fontWeight: "500",
  },
  deviceBadge: {
    backgroundColor: colors.primary[100],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.xs,
    alignSelf: "flex-start",
  },
  deviceBadgeText: {
    ...typography.bodySmall,
    color: colors.primary[700],
    fontWeight: "600",
    fontSize: 11,
  },
  scanCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.accent[50],
    borderWidth: 1,
    borderColor: colors.accent[200],
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  soundIconBadge: {
    backgroundColor: colors.success[500],
  },
  emissionIconBadge: {
    backgroundColor: colors.accent[500],
  },
  iconEmoji: {
    fontSize: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  scanButton: {
    marginBottom: 0,
  },
  scanSuccessBadge: {
    backgroundColor: colors.success[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.success[500],
  },
  scanNote: {
    ...typography.bodySmall,
    color: colors.success[700],
    fontWeight: "600",
  },
  soundStatus: {
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginTop: spacing.sm,
    borderLeftWidth: 4,
  },
  soundStatusSafe: {
    backgroundColor: colors.success[50],
    borderLeftColor: colors.success[500],
  },
  soundStatusViolation: {
    backgroundColor: colors.error[50],
    borderLeftColor: colors.error[500],
  },
  soundStatusText: {
    ...typography.body,
    fontWeight: "700",
    textAlign: "center",
  },
  submitButton: {
    marginVertical: spacing.lg,
  },
  tableContainer: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: spacing.md,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tableHeaderText: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 11,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.white,
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 70,
  },
  tableRowEven: {
    backgroundColor: colors.neutral[50],
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  tableCellContainer: {
    justifyContent: "center",
  },
  tableCellLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: spacing.xs / 2,
  },
  tableCellSublabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 11,
  },
  parameterColumn: {
    flex: 1.3,
  },
  valueColumn: {
    flex: 1,
  },
  tableInputContainer: {
    paddingLeft: spacing.sm,
  },
  tableInput: {
    marginBottom: 0,
  },
});


