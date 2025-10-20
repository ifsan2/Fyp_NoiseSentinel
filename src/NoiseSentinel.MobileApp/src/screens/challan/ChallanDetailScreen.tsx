import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Card } from '../../components/common/Card';
import { colors } from '../../styles/colors';
import { spacing, borderRadius } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import challanApi from '../../api/challanApi';
import { ChallanResponseDto } from '../../models/Challan';
import { formatters } from '../../utils/formatters';

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
      setError(err.response?.data?.message || 'Failed to load challan');
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
        <ErrorMessage message={error || 'Challan not found'} onRetry={loadChallan} />
      </View>
    );
  }

  const getStatusColor = () => {
    if (challan.isOverdue) return colors.error;
    if (challan.status === 'Paid') return colors.success;
    if (challan.status === 'Disputed') return colors.warning;
    return colors.info;
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
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{challan.status}</Text>
          {challan.isOverdue && (
            <Text style={styles.overdueText}>⚠️ OVERDUE</Text>
          )}
        </View>

        {/* Vehicle & Violation */}
        <Card variant="elevated">
          <Text style={styles.cardTitle}>🚗 Vehicle & Violation</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Plate Number:</Text>
            <Text style={styles.value}>{challan.vehiclePlateNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Make/Model:</Text>
            <Text style={styles.value}>{challan.vehicleMake || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Color:</Text>
            <Text style={styles.value}>{challan.vehicleColor || 'N/A'}</Text>
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
            <Text style={styles.value}>{challan.accusedContact || 'N/A'}</Text>
          </View>
        </Card>

        {/* Emission Report Evidence */}
        <Card>
          <Text style={styles.cardTitle}>📊 Emission Report Evidence</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Device:</Text>
            <Text style={styles.value}>{challan.deviceName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Sound Level:</Text>
            <Text style={[styles.value, styles.soundLevel]}>
              {formatters.formatSoundLevel(challan.soundLevelDBa)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ML Classification:</Text>
            <Text style={styles.value}>{challan.mlClassification || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Test Date:</Text>
            <Text style={styles.value}>
              {formatters.formatDateTime(challan.emissionTestDateTime)}
            </Text>
          </View>
          <View style={styles.integrityBadge}>
            <Text style={styles.integrityText}>✓ {challan.integrityStatus}</Text>
          </View>
        </Card>

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
            <Text style={[styles.value, challan.daysUntilDue < 0 && styles.overdue]}>
              {challan.daysUntilDue > 0
                ? `${challan.daysUntilDue} days`
                : challan.daysUntilDue === 0
                ? 'Today'
                : `${Math.abs(challan.daysUntilDue)} days overdue`}
            </Text>
          </View>
        </Card>

        {/* Evidence & Bank */}
        {(challan.evidencePath || challan.bankDetails) && (
          <Card>
            <Text style={styles.cardTitle}>📎 Additional Information</Text>
            {challan.evidencePath && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Evidence:</Text>
                <Text style={styles.value} numberOfLines={2}>
                  {challan.evidencePath}
                </Text>
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
              <Text style={styles.firText}>
                FIR ID: {challan.firId}
              </Text>
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
            This challan is protected by digital signature from the emission report
          </Text>
        </Card>
      </ScrollView>
    </View>
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
  statusBanner: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
  },
  overdueText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
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
    flex: 1,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  violation: {
    color: colors.error,
  },
  penalty: {
    color: colors.error,
    fontSize: 18,
  },
  soundLevel: {
    color: colors.error,
    fontWeight: '700',
  },
  overdue: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  cognizableBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.warning + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  cognizableText: {
    ...typography.body,
    color: colors.warning,
    fontWeight: '700',
  },
  integrityBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.success + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  integrityText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  firCard: {
    alignItems: 'center',
    padding: spacing.md,
  },
  firTitle: {
    ...typography.h3,
    color: colors.warning,
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
    fontFamily: 'monospace',
    backgroundColor: colors.gray100,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  signatureHelp: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});