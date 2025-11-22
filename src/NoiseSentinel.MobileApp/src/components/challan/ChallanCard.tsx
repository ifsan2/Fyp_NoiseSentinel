import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from "react-native";
import { ChallanListItemDto } from "../../models/Challan";
import { colors } from "../../styles/colors";
import { spacing, borderRadius } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { formatters } from "../../utils/formatters";

// PREMIUM CHALLAN CARD
// Features: Micro-interactions, Premium shadows, Elegant status badges

interface ChallanCardProps {
  challan: ChallanListItemDto;
  onPress: (challanId: number) => void;
}

export const ChallanCard: React.FC<ChallanCardProps> = ({
  challan,
  onPress,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const getStatusColor = () => {
    if (challan.isOverdue) return colors.error[500];
    if (challan.status === "Paid") return colors.success[500];
    if (challan.status === "Disputed") return colors.warning[500];
    return colors.info[500];
  };

  const getStatusBg = () => {
    if (challan.isOverdue) return colors.error[50];
    if (challan.status === "Paid") return colors.success[50];
    if (challan.status === "Disputed") return colors.warning[50];
    return colors.info[50];
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(challan.challanId)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.challanIdLabel}>Challan ID</Text>
          <Text style={styles.challanId}>#{challan.challanId}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusBg() },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow.default,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
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
    color: colors.primary[700],
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  plateNumber: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: "700",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
  content: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    fontWeight: "500",
  },
  value: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
  penalty: {
    color: colors.error[600],
    fontSize: 16,
    fontWeight: "800",
  },
  overdue: {
    color: colors.error[600],
  },
  firBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.warning[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.warning[200],
  },
  firText: {
    ...typography.caption,
    color: colors.warning[700],
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  overdueWarning: {
    marginTop: spacing.md,
    backgroundColor: colors.error[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  overdueText: {
    ...typography.caption,
    color: colors.error[700],
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});

