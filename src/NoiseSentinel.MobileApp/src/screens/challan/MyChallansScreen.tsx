import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
} from "react-native";
import { Search, X } from "lucide-react-native";
import { Header } from "../../components/common/Header";
import { Loading } from "../../components/common/Loading";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { ChallanCard } from "../../components/challan/ChallanCard";
import { getChallanType, CHALLAN_TYPE } from "../../utils/challanTypeHelper";
import { colors } from "../../styles/colors";
import { spacing, borderRadius } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import challanApi from "../../api/challanApi";
import { ChallanListItemDto } from "../../models/Challan";
import { CHALLAN_STATUS } from "../../utils/constants";

interface MyChallansScreenProps {
  navigation: any;
}

export const MyChallansScreen: React.FC<MyChallansScreenProps> = ({
  navigation,
}) => {
  const [challans, setChallans] = useState<ChallanListItemDto[]>([]);
  const [filteredChallans, setFilteredChallans] = useState<
    ChallanListItemDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadChallans();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [activeFilter, challans, searchQuery]);

  const loadChallans = async () => {
    try {
      setError(null);
      const data = await challanApi.getMyChallans();
      setChallans(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load challans");
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
    let result = challans;

    // Apply search filter first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.accusedName?.toLowerCase().includes(query) ||
          c.vehiclePlateNumber?.toLowerCase().includes(query) ||
          c.violationType?.toLowerCase().includes(query) ||
          c.challanId.toString().includes(query),
      );
    }

    // Then apply status/type filter
    if (activeFilter === "All") {
      setFilteredChallans(result);
    } else if (activeFilter === "Overdue") {
      setFilteredChallans(result.filter((c) => c.isOverdue));
    } else if (activeFilter === "FIR") {
      setFilteredChallans(result.filter((c) => c.hasFir));
    } else if (activeFilter === CHALLAN_TYPE.TRAFFIC) {
      setFilteredChallans(
        result.filter(
          (c) =>
            getChallanType(c.violationType, c.emissionReportId) ===
            CHALLAN_TYPE.TRAFFIC,
        ),
      );
    } else if (activeFilter === CHALLAN_TYPE.NON_TRAFFIC) {
      setFilteredChallans(
        result.filter(
          (c) =>
            getChallanType(c.violationType, c.emissionReportId) ===
            CHALLAN_TYPE.NON_TRAFFIC,
        ),
      );
    } else {
      setFilteredChallans(result.filter((c) => c.status === activeFilter));
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleChallanPress = (challanId: number) => {
    navigation.navigate("ChallanDetail", { challanId });
  };

  const filters = [
    "All",
    CHALLAN_TYPE.TRAFFIC,
    CHALLAN_TYPE.NON_TRAFFIC,
    CHALLAN_STATUS.UNPAID,
    CHALLAN_STATUS.PAID,
    "Overdue",
    "FIR",
  ];

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search
            size={18}
            color={colors.text.secondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, plate, violation..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        >
          {filters.map((item) => (
            <TouchableOpacity
              key={item}
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
          ))}
        </ScrollView>
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
    backgroundColor: colors.background.secondary,
  },
  searchContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: colors.text.primary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
  },
  filtersList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    marginRight: spacing.sm,
    minWidth: 70,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    elevation: 2,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  filterTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100, // Space for floating tab bar
  },
});
