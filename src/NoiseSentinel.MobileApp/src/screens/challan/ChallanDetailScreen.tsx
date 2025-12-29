import { CommonActions } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import challanApi from "../../api/challanApi";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Header } from "../../components/common/Header";
import { Loading } from "../../components/common/Loading";
import { ChallanResponseDto } from "../../models/Challan";
import { colors } from "../../styles/colors";
import { borderRadius, spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { formatters } from "../../utils/formatters";

interface ChallanDetailScreenProps {
  navigation: any;
  route: any;
}

export const ChallanDetailScreen: React.FC<ChallanDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { challanId } = route.params;
  const [challan, setChallan] = useState<ChallanResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChallan();
  }, []);

  const loadChallan = async () => {
    try {
      setError(null);
      const data = await challanApi.getChallanById(challanId);
      setChallan(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load challan");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallan();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Challan Details"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <Loading message="Loading challan..." fullScreen />
      </View>
    );
  }

  if (error || !challan) {
    return (
      <View style={styles.container}>
        <Header
          title="Challan Details"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <ErrorMessage
          message={error || "Challan not found"}
          onRetry={loadChallan}
        />
      </View>
    );
  }

  const getStatusColor = () => {
    if (challan.isOverdue) return colors.error[500];
    if (challan.status === "Paid") return colors.success[500];
    if (challan.status === "Disputed") return colors.warning[500];
    return colors.info[500];
  };

  return (
    <View style={styles.container}>
      <Header
        title="Challan Details"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Badge */}
        <View
          style={[styles.statusBanner, { backgroundColor: getStatusColor() }]}
        >
          <Text style={styles.statusText}>{challan.status}</Text>
          {challan.isOverdue && (
            <Text style={styles.overdueText}>⚠️ OVERDUE</Text>
          )}
        </View>

        {/* Challan ID Card */}
        <Card variant="elevated">
          <View style={styles.challanIdContainer}>
            <Text style={styles.challanIdLabel}>CHALLAN ID</Text>
            <Text style={styles.challanIdValue}>#{challan.challanId}</Text>
          </View>
        </Card>

        {/* Vehicle & Violation */}
        <Card variant="elevated">
          <Text style={styles.cardTitle}>🚗 Vehicle & Violation</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Plate Number:</Text>
            <Text style={styles.value}>{challan.vehiclePlateNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Make/Model:</Text>
            <Text style={styles.value}>{challan.vehicleMake || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Color:</Text>
            <Text style={styles.value}>{challan.vehicleColor || "N/A"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Violation Type:</Text>
            <Text style={[styles.value, styles.violation]}>
              {challan.violationType}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Penalty Amount:</Text>
            <Text style={[styles.value, styles.penalty]}>
              {formatters.formatCurrency(challan.penaltyAmount)}
            </Text>
          </View>
          {challan.isCognizable && (
            <View style={styles.cognizableBadge}>
              <Text style={styles.cognizableText}>⚖️ Cognizable Offense</Text>
            </View>
          )}
        </Card>

        {/* Accused Details */}
        <Card>
          <Text style={styles.cardTitle}>👤 Accused/Owner Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{challan.accusedName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>CNIC:</Text>
            <Text style={styles.value}>{challan.accusedCnic}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Contact:</Text>
            <Text style={styles.value}>{challan.accusedContact || "N/A"}</Text>
          </View>
        </Card>

        {/* Emission Report Evidence - Only show if emission report exists */}
        {challan.emissionReportId && (
          <Card>
            <Text style={styles.cardTitle}>📊 Emission Report Evidence</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Device:</Text>
              <Text style={styles.value}>{challan.deviceName || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Sound Level:</Text>
              <Text style={[styles.value, styles.soundLevel]}>
                {challan.soundLevelDBa
                  ? formatters.formatSoundLevel(challan.soundLevelDBa)
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>ML Classification:</Text>
              <Text style={styles.value}>
                {challan.mlClassification || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Test Date:</Text>
              <Text style={styles.value}>
                {challan.emissionTestDateTime
                  ? formatters.formatDateTime(challan.emissionTestDateTime)
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.integrityBadge}>
              <Text style={styles.integrityText}>
                ✓ {challan.integrityStatus}
              </Text>
            </View>
          </Card>
        )}

        {/* Officer & Station */}
        <Card>
          <Text style={styles.cardTitle}>👮 Issued By</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Officer:</Text>
            <Text style={styles.value}>{challan.officerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Badge Number:</Text>
            <Text style={styles.value}>{challan.officerBadgeNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Station:</Text>
            <Text style={styles.value}>{challan.stationName}</Text>
          </View>
        </Card>

        {/* Dates */}
        <Card>
          <Text style={styles.cardTitle}>📅 Important Dates</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Issue Date:</Text>
            <Text style={styles.value}>
              {formatters.formatDateTime(challan.issueDateTime)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={[styles.value, challan.isOverdue && styles.overdue]}>
              {formatters.formatDate(challan.dueDateTime)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Days Until Due:</Text>
            <Text
              style={[styles.value, challan.daysUntilDue < 0 && styles.overdue]}
            >
              {challan.daysUntilDue > 0
                ? `${challan.daysUntilDue} days`
                : challan.daysUntilDue === 0
                ? "Today"
                : `${Math.abs(challan.daysUntilDue)} days overdue`}
            </Text>
          </View>
        </Card>

        {/* Evidence & Bank */}
        {(challan.evidencePath || challan.bankDetails) && (
          <Card>
            <Text style={styles.cardTitle}>📎 Additional Information</Text>
            {challan.evidencePath && (
              <View style={styles.evidenceContainer}>
                <Text style={styles.label}>Evidence Photo:</Text>
                <TouchableOpacity activeOpacity={0.9}>
                  <Image
                    source={{ uri: challan.evidencePath }}
                    style={styles.evidenceImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
            )}
            {challan.bankDetails && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Bank Details:</Text>
                <Text style={styles.value} numberOfLines={2}>
                  {challan.bankDetails}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* FIR Status */}
        {challan.hasFir && (
          <Card variant="elevated">
            <View style={styles.firCard}>
              <Text style={styles.firTitle}>⚖️ FIR Filed</Text>
              <Text style={styles.firText}>FIR ID: {challan.firId}</Text>
              <Text style={styles.firSubtext}>
                This case has been escalated to Station Authority
              </Text>
            </View>
          </Card>
        )}

        {/* Digital Signature */}
        <Card>
          <Text style={styles.cardTitle}>🔐 Digital Signature</Text>
          <Text style={styles.signatureText} numberOfLines={3}>
            {challan.digitalSignatureValue}
          </Text>
          <Text style={styles.signatureHelp}>
            This challan is protected by digital signature from the emission
            report
          </Text>
        </Card>
      </ScrollView>

      {/* Footer with Home Button */}
      <View style={styles.footer}>
        <Button
          title="🏠 Go to Home"
          onPress={() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "MainTabs", params: { screen: "Dashboard" } }],
              })
            );
          }}
          fullWidth
          variant="primary"
        />
      </View>
    </View>
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
  statusBanner: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: "700",
  },
  overdueText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "700",
  },
  challanIdContainer: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  challanIdLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  challanIdValue: {
    ...typography.h1,
    color: colors.primary[500],
    fontWeight: "700",
    fontSize: 32,
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
  evidenceContainer: {
    marginBottom: spacing.md,
  },
  evidenceImage: {
    width: "100%",
    height: 200,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    backgroundColor: colors.gray100,
  },
  violation: {
    color: colors.error[600],
  },
  penalty: {
    color: colors.error[600],
    fontSize: 18,
  },
  soundLevel: {
    color: colors.error[600],
    fontWeight: "700",
  },
  overdue: {
    color: colors.error[600],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.sm,
  },
  cognizableBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.warning[500] + "20",
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: "center",
  },
  cognizableText: {
    ...typography.body,
    color: colors.warning[600],
    fontWeight: "700",
  },
  integrityBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.success[500] + "20",
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: "center",
  },
  integrityText: {
    ...typography.caption,
    color: colors.success[600],
    fontWeight: "600",
  },
  firCard: {
    alignItems: "center",
    padding: spacing.md,
  },
  firTitle: {
    ...typography.h3,
    color: colors.warning[600],
    marginBottom: spacing.sm,
  },
  firText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  firSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  signatureText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: "monospace",
    backgroundColor: colors.gray100,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  signatureHelp: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});


