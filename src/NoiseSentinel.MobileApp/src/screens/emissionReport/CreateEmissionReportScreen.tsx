import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import emissionReportApi from '../../api/emissionReportApi';
import iotDeviceApi from '../../api/iotDeviceApi';
import { CreateEmissionReportDto } from '../../models/EmissionReport';
import { SOUND_THRESHOLD } from '../../utils/constants';
import Toast from 'react-native-toast-message';

interface CreateEmissionReportScreenProps {
  navigation: any;
  route: any;
}

export const CreateEmissionReportScreen: React.FC<CreateEmissionReportScreenProps> = ({
  navigation,
  route,
}) => {
  const deviceIdFromRoute = route.params?.deviceId;

  const [deviceId, setDeviceId] = useState(deviceIdFromRoute?.toString() || '');
  const [deviceName, setDeviceName] = useState('');
  const [soundLevel, setSoundLevel] = useState('');
  const [co, setCo] = useState('');
  const [co2, setCo2] = useState('');
  const [hc, setHc] = useState('');
  const [nox, setNox] = useState('');
  const [mlClassification, setMlClassification] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (deviceIdFromRoute) {
      loadDeviceInfo(deviceIdFromRoute);
    }
  }, [deviceIdFromRoute]);

  const loadDeviceInfo = async (id: number) => {
    try {
      const device = await iotDeviceApi.getDeviceById(id);
      setDeviceName(device.deviceName);
    } catch (error) {
      console.error('Error loading device:', error);
    }
  };

  const validate = (): boolean => {
    const newErrors: any = {};

    if (!deviceId) {
      newErrors.deviceId = 'Device ID is required';
    }

    if (!soundLevel) {
      newErrors.soundLevel = 'Sound level is required';
    } else {
      const level = parseFloat(soundLevel);
      if (isNaN(level) || level < 0 || level > 200) {
        newErrors.soundLevel = 'Sound level must be between 0 and 200 dBA';
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
        deviceId: parseInt(deviceId),
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
        type: 'success',
        text1: 'Report Generated!',
        text2: response.isViolation
          ? `⚠️ Violation Detected! (${response.soundLevelDBa} dBA)`
          : `✓ No Violation (${response.soundLevelDBa} dBA)`,
      });

      // Navigate to create challan if violation detected
      if (response.isViolation) {
        setTimeout(() => {
          navigation.navigate('CreateChallan', {
            emissionReportId: response.emissionReportId,
          });
        }, 2000);
      } else {
        navigation.goBack();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to create report',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSoundLevelColor = () => {
    const level = parseFloat(soundLevel);
    if (isNaN(level)) return colors.textSecondary;
    return level > SOUND_THRESHOLD ? colors.error : colors.success;
  };

  const getSoundLevelStatus = () => {
    const level = parseFloat(soundLevel);
    if (isNaN(level)) return '';
    return level > SOUND_THRESHOLD
      ? `⚠️ VIOLATION (Legal limit: ${SOUND_THRESHOLD} dBA)`
      : `✓ Within Legal Limit`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="Generate Report"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Device Info */}
        {deviceName && (
          <Card style={styles.deviceCard} variant="outlined">
            <Text style={styles.deviceLabel}>Paired Device:</Text>
            <Text style={styles.deviceValue}>🔗 {deviceName}</Text>
          </Card>
        )}

        {/* Required Fields */}
        <Card>
          <Text style={styles.sectionTitle}>📊 Required Readings</Text>

          <Input
            label="Device ID"
            placeholder="Enter device ID"
            value={deviceId}
            onChangeText={setDeviceId}
            error={errors.deviceId}
            keyboardType="numeric"
            required
            editable={!deviceIdFromRoute}
          />

          <Input
            label="Sound Level (dBA)"
            placeholder="Enter sound level"
            value={soundLevel}
            onChangeText={setSoundLevel}
            error={errors.soundLevel}
            keyboardType="decimal-pad"
            required
            helperText={`Legal limit: ${SOUND_THRESHOLD} dBA`}
          />

          {soundLevel && !errors.soundLevel && (
            <View style={styles.soundStatus}>
              <Text style={[styles.soundStatusText, { color: getSoundLevelColor() }]}>
                {getSoundLevelStatus()}
              </Text>
            </View>
          )}
        </Card>

        {/* Optional Fields */}
        <Card>
          <Text style={styles.sectionTitle}>🧪 Optional Emission Readings</Text>

          <Input
            label="CO (Carbon Monoxide)"
            placeholder="Enter CO level"
            value={co}
            onChangeText={setCo}
            keyboardType="decimal-pad"
          />

          <Input
            label="CO2 (Carbon Dioxide)"
            placeholder="Enter CO2 level"
            value={co2}
            onChangeText={setCo2}
            keyboardType="decimal-pad"
          />

          <Input
            label="HC (Hydrocarbons)"
            placeholder="Enter HC level"
            value={hc}
            onChangeText={setHc}
            keyboardType="decimal-pad"
          />

          <Input
            label="NOx (Nitrogen Oxides)"
            placeholder="Enter NOx level"
            value={nox}
            onChangeText={setNox}
            keyboardType="decimal-pad"
          />

          <Input
            label="ML Classification"
            placeholder="e.g., Modified Silencer Detected"
            value={mlClassification}
            onChangeText={setMlClassification}
            multiline
            numberOfLines={2}
          />
        </Card>

        <Button
          title={loading ? 'Generating...' : 'Generate Report'}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.primary,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  soundStatus: {
    backgroundColor: colors.gray100,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginTop: spacing.sm,
  },
  soundStatusText: {
    ...typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  submitButton: {
    marginVertical: spacing.lg,
  },
});