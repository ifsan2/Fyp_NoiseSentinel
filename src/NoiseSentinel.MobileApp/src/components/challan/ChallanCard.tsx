import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChallanListItemDto } from "../../models/Challan";
import { colors } from "../../styles/colors";
import { spacing, borderRadius } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { formatters } from "../../utils/formatters";

interface ChallanCardProps {
  challan: ChallanListItemDto;
  onPress: (challanId: number) => void;
}

export const ChallanCard: React.FC<ChallanCardProps> = ({
  challan,
  onPress,
}) => {
  const getStatusColor = () => {
    if (challan.isOverdue) return colors.error;
    if (challan.status === "Paid") return colors.success;
    if (challan.status === "Disputed") return colors.warning;
    return colors.info;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(challan.challanId)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.challanIdLabel}>Challan ID</Text>
          <Text style={styles.challanId}>#{challan.challanId}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + "20" },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {challan.status}
          </Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.plateNumber}>🚗 {challan.vehiclePlateNumber}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Accused:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {challan.accusedName}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Violation:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {challan.violationType}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Penalty:</Text>
          <Text style={[styles.value, styles.penalty]}>
            {formatters.formatCurrency(challan.penaltyAmount)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Issued:</Text>
          <Text style={styles.value}>
            {formatters.formatDateTime(challan.issueDateTime)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Due Date:</Text>
          <Text style={[styles.value, challan.isOverdue && styles.overdue]}>
            {formatters.formatDate(challan.dueDateTime)}
          </Text>
        </View>
      </View>

      {challan.hasFir && (
        <View style={styles.firBadge}>
          <Text style={styles.firText}>⚖️ FIR Filed</Text>
        </View>
      )}

      {challan.isOverdue && (
        <View style={styles.overdueWarning}>
          <Text style={styles.overdueText}>⚠️ Overdue</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: "column",
  },
  challanIdLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    textTransform: "uppercase",
  },
  challanId: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: "700",
  },
  plateNumber: {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  content: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  value: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  penalty: {
    color: colors.error,
    fontSize: 16,
  },
  overdue: {
    color: colors.error,
  },
  firBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.warning + "20",
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: "center",
  },
  firText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: "600",
  },
  overdueWarning: {
    marginTop: spacing.sm,
    backgroundColor: colors.error + "20",
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: "center",
  },
  overdueText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: "700",
  },
});
