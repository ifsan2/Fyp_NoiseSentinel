import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Card } from '../../components/common/Card';
import { colors } from '../../styles/colors';
import { spacing, borderRadius } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import violationApi from '../../api/violationApi';
import { ViolationListItemDto } from '../../models/Violation';
import { formatters } from '../../utils/formatters';

interface ViolationsScreenProps {
  navigation: any;
}

export const ViolationsScreen: React.FC<ViolationsScreenProps> = ({ navigation }) => {
  const [violations, setViolations] = useState<ViolationListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'cognizable'>('all');

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    try {
      setError(null);
      const data = await violationApi.getAllViolations();
      setViolations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load violations');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadViolations();
    setRefreshing(false);
  };

  const getFilteredViolations = () => {
    if (filter === 'cognizable') {
      return violations.filter((v) => v.isCognizable);
    }
    return violations;
  };

  const renderViolation = ({ item }: { item: ViolationListItemDto }) => (
    <Card style={styles.violationCard}>
      <View style={styles.violationHeader}>
        <Text style={styles.violationType}>{item.violationType}</Text>
        {item.isCognizable && (
          <View style={styles.cognizableBadge}>
            <Text style={styles.cognizableText}>⚖️ Cognizable</Text>
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.divider} />

      <View style={styles.violationFooter}>
        <View style={styles.penaltyContainer}>
          <Text style={styles.penaltyLabel}>Penalty Amount:</Text>
          <Text style={styles.penaltyAmount}>
            {formatters.formatCurrency(item.penaltyAmount)}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            📋 {item.totalChallans} Challans Issued
          </Text>
        </View>
      </View>

      {item.isCognizable && (
        <View style={styles.cognizableInfo}>
          <Text style={styles.cognizableInfoText}>
            ℹ️ This violation is cognizable - FIR can be filed by Station Authority
          </Text>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Violations"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <Loading message="Loading violations..." fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Violations"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({violations.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'cognizable' && styles.filterTabActive]}
          onPress={() => setFilter('cognizable')}
        >
          <Text style={[styles.filterText, filter === 'cognizable' && styles.filterTextActive]}>
            Cognizable ({violations.filter((v) => v.isCognizable).length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getFilteredViolations()}
        renderItem={renderViolation}
        keyExtractor={(item) => item.violationId.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          error ? (
            <ErrorMessage message={error} onRetry={loadViolations} />
          ) : (
            <ErrorMessage message="No violations found" />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: colors.primary[600],
  },
  filterText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.primary[600],
  },
  listContent: {
    padding: spacing.md,
  },
  violationCard: {
    marginBottom: spacing.md,
  },
  violationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  violationType: {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
  },
  cognizableBadge: {
    backgroundColor: colors.warning[500] + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  cognizableText: {
    ...typography.caption,
    color: colors.warning[600],
    fontWeight: '700',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.sm,
  },
  violationFooter: {
    gap: spacing.sm,
  },
  penaltyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  penaltyLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  penaltyAmount: {
    ...typography.h3,
    color: colors.error[600],
  },
  statsContainer: {
    backgroundColor: colors.neutral[100],
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  cognizableInfo: {
    marginTop: spacing.sm,
    backgroundColor: colors.info[500] + '10',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  cognizableInfoText: {
    ...typography.caption,
    color: colors.info[600],
  },
});

