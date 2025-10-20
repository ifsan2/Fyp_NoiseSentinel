import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import vehicleApi from '../../api/vehicleApi';
import challanApi from '../../api/challanApi';
import { VehicleResponseDto } from '../../models/Vehicle';
import { ChallanListItemDto } from '../../models/Challan';
import { formatters } from '../../utils/formatters';

interface SearchVehicleScreenProps {
  navigation: any;
}

export const SearchVehicleScreen: React.FC<SearchVehicleScreenProps> = ({ navigation }) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleResponseDto | null>(null);
  const [challans, setChallans] = useState<ChallanListItemDto[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!plateNumber.trim()) {
      setError('Please enter a plate number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setVehicle(null);
      setChallans([]);

      const vehicleData = await vehicleApi.getVehicleByPlateNumber(plateNumber);
      setVehicle(vehicleData);

      // Load challans for this vehicle
      const challansData = await challanApi.getChallansByVehicle(vehicleData.vehicleId);
      setChallans(challansData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Vehicle not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="Search Vehicle"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.title}>🔍 Search by Plate Number</Text>
          <Input
            placeholder="Enter plate number (e.g., PK-ABC-123)"
            value={plateNumber}
            onChangeText={setPlateNumber}
            autoCapitalize="characters"
            error={error}
          />
          <Button
            title={loading ? 'Searching...' : 'Search'}
            onPress={handleSearch}
            loading={loading}
            disabled={loading}
            fullWidth
          />
        </Card>

        {loading && <Loading />}

        {vehicle && (
          <>
            {/* Vehicle Details */}
            <Card variant="elevated">
              <Text style={styles.cardTitle}>🚗 Vehicle Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Plate Number:</Text>
                <Text style={styles.value}>{vehicle.plateNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Make/Model:</Text>
                <Text style={styles.value}>{vehicle.make || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Color:</Text>
                <Text style={styles.value}>{vehicle.color || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Chasis No:</Text>
                <Text style={styles.value}>{vehicle.chasisNo || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Engine No:</Text>
                <Text style={styles.value}>{vehicle.engineNo || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Registration Year:</Text>
                <Text style={styles.value}>{vehicle.registrationYear}</Text>
              </View>
            </Card>

            {/* Owner Details */}
            {vehicle.ownerName && (
              <Card>
                <Text style={styles.cardTitle}>👤 Owner Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Name:</Text>
                  <Text style={styles.value}>{vehicle.ownerName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>CNIC:</Text>
                  <Text style={styles.value}>{vehicle.ownerCnic || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Contact:</Text>
                  <Text style={styles.value}>{vehicle.ownerContact || 'N/A'}</Text>
                </View>
              </Card>
            )}

            {/* Violation History */}
            <Card>
              <Text style={styles.cardTitle}>⚠️ Violation History</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{vehicle.totalViolations}</Text>
                  <Text style={styles.statLabel}>Total Violations</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{challans.length}</Text>
                  <Text style={styles.statLabel}>Challans</Text>
                </View>
              </View>

              {challans.length > 0 && (
                <View style={styles.challansList}>
                  <Text style={styles.challansTitle}>Recent Challans:</Text>
                  {challans.slice(0, 5).map((challan) => (
                    <View key={challan.challanId} style={styles.challanItem}>
                      <Text style={styles.challanText}>
                        {challan.violationType} - {formatters.formatCurrency(challan.penaltyAmount)}
                      </Text>
                      <Text style={styles.challanDate}>
                        {formatters.formatDate(challan.issueDateTime)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </>
        )}
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
  title: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.md,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  challansList: {
    marginTop: spacing.md,
  },
  challansTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  challanItem: {
    backgroundColor: colors.gray100,
    padding: spacing.sm,
    borderRadius: spacing.xs,
    marginBottom: spacing.xs,
  },
  challanText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  challanDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});