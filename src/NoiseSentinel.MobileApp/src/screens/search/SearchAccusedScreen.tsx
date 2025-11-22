import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Header } from "../../components/common/Header";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Loading } from "../../components/common/Loading";
import { colors } from "../../styles/colors";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import accusedApi from "../../api/accusedApi";
import challanApi from "../../api/challanApi";
import { AccusedResponseDto } from "../../models/Accused";
import { ChallanListItemDto } from "../../models/Challan";
import { validation } from "../../utils/validation";
import { formatters } from "../../utils/formatters";

interface SearchAccusedScreenProps {
  navigation: any;
}

export const SearchAccusedScreen: React.FC<SearchAccusedScreenProps> = ({
  navigation,
}) => {
  const [cnic, setCnic] = useState("");
  const [loading, setLoading] = useState(false);
  const [accused, setAccused] = useState<AccusedResponseDto | null>(null);
  const [challans, setChallans] = useState<ChallanListItemDto[]>([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!cnic.trim()) {
      setError("Please enter a CNIC");
      return;
    }

    if (!validation.cnic(cnic)) {
      setError("Invalid CNIC format (12345-1234567-1)");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAccused(null);
      setChallans([]);

      const accusedData = await accusedApi.getAccusedByCnic(cnic);
      setAccused(accusedData);

      // Load challans for this person
      const challansData = await challanApi.getChallansByAccused(
        accusedData.accusedId
      );
      setChallans(challansData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Person not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header
        title="Search Accused"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.title}>🔍 Search by CNIC</Text>
          <Input
            placeholder="Enter CNIC (12345-1234567-1)"
            value={cnic}
            onChangeText={setCnic}
            keyboardType="numeric"
            error={error}
          />
          <Button
            title={loading ? "Searching..." : "Search"}
            onPress={handleSearch}
            loading={loading}
            disabled={loading}
            fullWidth
          />
        </Card>

        {loading && <Loading />}

        {accused && (
          <>
            {/* Personal Information */}
            <Card variant="elevated">
              <Text style={styles.cardTitle}>👤 Personal Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Full Name:</Text>
                <Text style={styles.value}>{accused.fullName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>CNIC:</Text>
                <Text style={styles.value}>{accused.cnic}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>City:</Text>
                <Text style={styles.value}>{accused.city || "N/A"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Province:</Text>
                <Text style={styles.value}>{accused.province || "N/A"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value} numberOfLines={2}>
                  {accused.address || "N/A"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Contact:</Text>
                <Text style={styles.value}>{accused.contact || "N/A"}</Text>
              </View>
            </Card>

            {/* Statistics */}
            <Card>
              <Text style={styles.cardTitle}>📊 Statistics</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {accused.totalViolations}
                  </Text>
                  <Text style={styles.statLabel}>Total Violations</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{accused.totalVehicles}</Text>
                  <Text style={styles.statLabel}>Vehicles Owned</Text>
                </View>
              </View>
            </Card>

            {/* Owned Vehicles */}
            {accused.vehicles && accused.vehicles.length > 0 && (
              <Card>
                <Text style={styles.cardTitle}>🚗 Owned Vehicles</Text>
                {accused.vehicles.map((vehicle) => (
                  <View key={vehicle.vehicleId} style={styles.vehicleItem}>
                    <Text style={styles.vehicleText}>
                      {vehicle.plateNumber} - {vehicle.make || "Unknown"} (
                      {vehicle.color || "N/A"})
                    </Text>
                  </View>
                ))}
              </Card>
            )}

            {/* Violation History */}
            {challans.length > 0 && (
              <Card>
                <Text style={styles.cardTitle}>⚠️ Violation History</Text>
                {challans.slice(0, 5).map((challan) => (
                  <View key={challan.challanId} style={styles.challanItem}>
                    <View style={styles.challanHeader}>
                      <Text style={styles.challanId}>
                        Challan #{challan.challanId}
                      </Text>
                      <Text style={styles.challanAmount}>
                        {formatters.formatCurrency(challan.penaltyAmount)}
                      </Text>
                    </View>
                    <Text style={styles.challanViolation}>
                      {challan.violationType}
                    </Text>
                    <View style={styles.challanDetails}>
                      <Text style={styles.challanText}>
                        Vehicle: {challan.vehiclePlateNumber}
                      </Text>
                      <Text style={styles.challanDate}>
                        {formatters.formatDate(challan.issueDateTime)}
                      </Text>
                    </View>
                    <View style={styles.challanStatus}>
                      <Text
                        style={[
                          styles.statusBadge,
                          challan.status === "Paid" && styles.statusPaid,
                          challan.isOverdue && styles.statusOverdue,
                        ]}
                      >
                        {challan.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: spacing.md,
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    ...typography.h2,
    color: colors.primary[500],
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  vehicleItem: {
    backgroundColor: colors.gray100,
    padding: spacing.sm,
    borderRadius: spacing.xs,
    marginBottom: spacing.xs,
  },
  vehicleText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  challanItem: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  challanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  challanId: {
    ...typography.bodySmall,
    color: colors.primary[500],
    fontWeight: "700",
  },
  challanViolation: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  challanAmount: {
    ...typography.body,
    color: colors.error[600],
    fontWeight: "700",
  },
  challanDetails: {
    marginBottom: spacing.xs,
  },
  challanText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  challanDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  challanStatus: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusBadge: {
    ...typography.caption,
    color: colors.info[600],
    fontWeight: "600",
  },
  statusPaid: {
    color: colors.success[600],
  },
  statusOverdue: {
    color: colors.error[600],
  },
});


