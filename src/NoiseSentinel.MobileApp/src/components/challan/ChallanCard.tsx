import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { ChallanListItemDto } from "../../models/Challan";
import { colors } from "../../styles/colors";
import { formatters } from "../../utils/formatters";

// Clean, Professional Challan Card

interface ChallanCardProps {
  challan: ChallanListItemDto;
  onPress: (challanId: number) => void;
}

export const ChallanCard: React.FC<ChallanCardProps> = ({
  challan,
  onPress,
}) => {
  const getStatusColor = () => {
    if (challan.isOverdue) return colors.error[600];
    if (challan.status === "Paid") return colors.success[600];
    if (challan.status === "Disputed") return colors.warning[600];
    return colors.info[600];
  };

  const getStatusBg = () => {
    if (challan.isOverdue) return colors.error[50];
    if (challan.status === "Paid") return colors.success[50];
    if (challan.status === "Disputed") return colors.warning[50];
    return colors.info[50];
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(challan.challanId)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.challanIdLabel}>Challan</Text>
          <Text style={styles.challanId}>#{challan.challanId}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg() }]}>
          <View
            style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {challan.isOverdue ? "Overdue" : challan.status}
          </Text>
        </View>
      </View>

      {/* Vehicle Plate */}
      <Text style={styles.plateNumber}>{challan.vehiclePlateNumber}</Text>

      <View style={styles.divider} />

      {/* Details */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Accused</Text>
          <Text style={styles.value} numberOfLines={1}>
            {challan.accusedName}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Violation</Text>
          <Text style={styles.value} numberOfLines={1}>
            {challan.violationType}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Penalty</Text>
          <Text style={[styles.value, styles.penalty]}>
            {formatters.formatCurrency(challan.penaltyAmount)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Due Date</Text>
          <Text style={[styles.value, challan.isOverdue && styles.overdue]}>
            {formatters.formatDate(challan.dueDateTime)}
          </Text>
        </View>
      </View>

      {/* Badges */}
      {(challan.hasFir || challan.isOverdue) && (
        <View style={styles.badges}>
          {challan.hasFir && (
            <View style={styles.firBadge}>
              <Text style={styles.firText}>FIR Filed</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  challanIdLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  challanId: {
    fontSize: 18,
    color: colors.primary[700],
    fontWeight: "700",
  },
  plateNumber: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: "600",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginBottom: 12,
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  value: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  penalty: {
    color: colors.primary[700],
    fontWeight: "600",
  },
  overdue: {
    color: colors.error[600],
  },
  badges: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  firBadge: {
    backgroundColor: colors.error[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  firText: {
    fontSize: 11,
    color: colors.error[700],
    fontWeight: "600",
  },
});
