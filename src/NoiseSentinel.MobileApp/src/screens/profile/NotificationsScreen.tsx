import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  BellOff,
  ChevronLeft,
  Check,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  Radio,
  Bluetooth,
  FileText,
} from "lucide-react-native";
import { colors } from "../../styles/colors";
import { useAuth } from "../../contexts/AuthContext";
import notificationService, {
  Notification,
  NotificationType,
} from "../../services/notification.service";
import { format, formatDistanceToNow } from "date-fns";

export const NotificationsScreen: React.FC = ({ navigation }: any) => {
  const { userDetails } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!userDetails?.officerId) return;

    try {
      const data = await notificationService.getNotifications(
        userDetails.officerId,
      );
      setNotifications(data);

      const unread = await notificationService.getUnreadCount(
        userDetails.officerId,
      );
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userDetails]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (!userDetails?.officerId || notification.read) return;

    await notificationService.markAsRead(
      userDetails.officerId,
      notification.id,
    );
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    if (!userDetails?.officerId) return;

    await notificationService.markAllAsRead(userDetails.officerId);
    loadNotifications();
  };

  const handleDelete = async (notificationId: string) => {
    if (!userDetails?.officerId) return;

    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await notificationService.deleteNotification(
              userDetails.officerId!,
              notificationId,
            );
            loadNotifications();
          },
        },
      ],
    );
  };

  const handleClearAll = () => {
    if (!userDetails?.officerId) return;

    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await notificationService.clearAll(userDetails.officerId!);
            loadNotifications();
          },
        },
      ],
    );
  };

  const getNotificationIcon = (type: NotificationType) => {
    const iconProps = { size: 18, strokeWidth: 2 };

    switch (type) {
      case NotificationType.CHALLAN_CREATED:
        return <FileText {...iconProps} color={colors.success[600]} />;
      case NotificationType.DEVICE_PAIRED:
        return <Bluetooth {...iconProps} color={colors.primary[600]} />;
      case NotificationType.DEVICE_UNPAIRED:
        return <Radio {...iconProps} color={colors.warning[600]} />;
      case NotificationType.EMISSION_REPORT_CREATED:
        return <CheckCircle {...iconProps} color={colors.info[600]} />;
      case NotificationType.TEST_COMPLETED:
        return <CheckCircle {...iconProps} color={colors.accent[600]} />;
      case NotificationType.SYSTEM:
        return <Info {...iconProps} color={colors.neutral[600]} />;
      default:
        return <Bell {...iconProps} color={colors.neutral[600]} />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.CHALLAN_CREATED:
        return colors.success[50];
      case NotificationType.DEVICE_PAIRED:
        return colors.primary[50];
      case NotificationType.DEVICE_UNPAIRED:
        return colors.warning[50];
      case NotificationType.EMISSION_REPORT_CREATED:
        return colors.info[50];
      case NotificationType.TEST_COMPLETED:
        return colors.accent[50];
      case NotificationType.SYSTEM:
        return colors.neutral[50];
      default:
        return colors.neutral[50];
    }
  };

  const renderNotification = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[styles.notificationCard, !notification.read && styles.unreadCard]}
      onPress={() => handleMarkAsRead(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getNotificationColor(notification.type) },
          ]}
        >
          {getNotificationIcon(notification.type)}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            {!notification.read && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.notificationMessage}>{notification.message}</Text>

          {notification.metadata && (
            <View style={styles.metadataContainer}>
              {notification.metadata.plateNumber && (
                <Text style={styles.metadataText}>
                  🚗 {notification.metadata.plateNumber}
                </Text>
              )}
              {notification.metadata.deviceName && (
                <Text style={styles.metadataText}>
                  📡 {notification.metadata.deviceName}
                </Text>
              )}
              {notification.metadata.violationType && (
                <Text style={styles.metadataText}>
                  ⚠️ {notification.metadata.violationType}
                </Text>
              )}
            </View>
          )}

          <Text style={styles.timestamp}>
            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(notification.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={16} color={colors.error[500]} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={colors.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Action Bar */}
      {notifications.length > 0 && (
        <View style={styles.actionBar}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMarkAllAsRead}
            >
              <Check size={16} color={colors.primary[600]} strokeWidth={2} />
              <Text style={styles.actionButtonText}>Mark all read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearAll}
          >
            <Trash2 size={16} color={colors.error[600]} strokeWidth={2} />
            <Text style={[styles.actionButtonText, styles.clearButtonText]}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[600]}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <BellOff size={48} color={colors.neutral[300]} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>
              Your activity notifications will appear here
            </Text>
            <Text style={styles.emptyHint}>
              Challans created, device pairings, and test results
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) =>
              renderNotification(notification),
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.primary[700],
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.white,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.error[500],
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
    gap: 6,
  },
  clearButton: {
    backgroundColor: colors.error[50],
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary[600],
  },
  clearButtonText: {
    color: colors.error[600],
  },
  scrollContent: {
    padding: 16,
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  metadataContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  metadataText: {
    fontSize: 12,
    color: colors.text.tertiary,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.neutral[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: "center",
  },
});
