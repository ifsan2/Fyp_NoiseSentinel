import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { ChallanCard } from '../../components/challan/ChallanCard';
import { colors } from '../../styles/colors';
import { spacing, borderRadius } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import challanApi from '../../api/challanApi';
import { ChallanListItemDto } from '../../models/Challan';
import { CHALLAN_STATUS } from '../../utils/constants';

interface MyChallansScreenProps {
  navigation: any;
}

export const MyChallansScreen: React.FC<MyChallansScreenProps> = ({ navigation }) => {
  const [challans, setChallans] = useState<ChallanListItemDto[]>([]);
  const [filteredChallans, setFilteredChallans] = useState<ChallanListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  useEffect(() => {
    loadChallans();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [activeFilter, challans]);

  const loadChallans = async () => {
    try {
      setError(null);
      const data = await challanApi.getMyChallans();
      setChallans(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load challans');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallans();
    setRefreshing(false);
  };

  const applyFilter = () => {
    if (activeFilter === 'All') {
      setFilteredChallans(challans);
    } else if (activeFilter === 'Overdue') {
      setFilteredChallans(challans.filter((c) => c.isOverdue));
    } else if (activeFilter === 'FIR') {
      setFilteredChallans(challans.filter((c) => c.hasFir));
    } else {
      setFilteredChallans(challans.filter((c) => c.status === activeFilter));
    }
  };

  const handleChallanPress = (challanId: number) => {
    navigation.navigate('ChallanDetail', { challanId });
  };

  const filters = ['All', CHALLAN_STATUS.UNPAID, CHALLAN_STATUS.PAID, 'Overdue', 'FIR'];

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="My Challans"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        <Loading message="Loading challans..." fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="My Challans"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === item && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Challans List */}
      <FlatList
        data={filteredChallans}
        renderItem={({ item }) => (
          <ChallanCard challan={item} onPress={handleChallanPress} />
        )}
        keyExtractor={(item) => item.challanId.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          error ? (
            <ErrorMessage message={error} onRetry={loadChallans} />
          ) : (
            <ErrorMessage message="No challans found" />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.md,
  },
});