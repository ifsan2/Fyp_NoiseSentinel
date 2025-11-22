import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { ViolationListItemDto } from '../../models/Violation';
import { colors } from '../../styles/colors';
import { spacing, borderRadius } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import { formatters } from '../../utils/formatters';

interface ViolationSelectorProps {
  violations: ViolationListItemDto[];
  selectedViolationId?: number;
  onSelect: (violation: ViolationListItemDto) => void;
}

export const ViolationSelector: React.FC<ViolationSelectorProps> = ({
  violations,
  selectedViolationId,
  onSelect,
}) => {
  const renderViolation = ({ item }: { item: ViolationListItemDto }) => {
    const isSelected = item.violationId === selectedViolationId;

    return (
      <TouchableOpacity
        style={[styles.violationCard, isSelected && styles.violationCardSelected]}
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.violationHeader}>
          <Text style={[styles.violationType, isSelected && styles.violationTypeSelected]}>
            {item.violationType}
          </Text>
          {item.isCognizable && (
            <View style={styles.cognizableBadge}>
              <Text style={styles.cognizableText}>⚖️ Cognizable</Text>
            </View>
          )}
        </View>

        <Text style={styles.violationDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.violationFooter}>
          <Text style={styles.penaltyLabel}>Penalty:</Text>
          <Text style={styles.penaltyAmount}>
            {formatters.formatCurrency(item.penaltyAmount)}
          </Text>
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓ Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={violations}
      renderItem={renderViolation}
      keyExtractor={(item) => item.violationId.toString()}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  violationCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  violationCardSelected: {
    bordercolor: colors.primary[600],
    backgroundColor: colors.primary + '10',
  },
  violationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  violationType: {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
  },
  violationTypeSelected: {
    color: colors.primary[600],
  },
  cognizableBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  cognizableText: {
    ...typography.caption,
    color: colors.warning[600],
    fontWeight: '600',
  },
  violationDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  violationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  penaltyLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  penaltyAmount: {
    ...typography.h4,
    color: colors.error[600],
  },
  selectedIndicator: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary[600],
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  selectedText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
});

