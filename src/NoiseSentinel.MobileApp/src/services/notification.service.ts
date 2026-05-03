import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Notification Service
 * Manages local notifications for police officers
 * Stores officer-specific activity notifications locally
 */

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  metadata?: {
    challanId?: number;
    deviceId?: number;
    deviceName?: string;
    violationType?: string;
    plateNumber?: string;
    [key: string]: any;
  };
}

export enum NotificationType {
  CHALLAN_CREATED = "CHALLAN_CREATED",
  DEVICE_PAIRED = "DEVICE_PAIRED",
  DEVICE_UNPAIRED = "DEVICE_UNPAIRED",
  EMISSION_REPORT_CREATED = "EMISSION_REPORT_CREATED",
  TEST_COMPLETED = "TEST_COMPLETED",
  SYSTEM = "SYSTEM",
}

const STORAGE_KEY = "OFFICER_NOTIFICATIONS";
const MAX_NOTIFICATIONS = 100; // Keep last 100 notifications per officer

class NotificationService {
  /**
   * Get storage key for specific officer
   */
  private getOfficerKey(officerId: number): string {
    return `${STORAGE_KEY}_${officerId}`;
  }

  /**
   * Get all notifications for an officer
   */
  async getNotifications(officerId: number): Promise<Notification[]> {
    try {
      const key = this.getOfficerKey(officerId);
      const data = await AsyncStorage.getItem(key);

      if (!data) return [];

      const notifications: Notification[] = JSON.parse(data);
      // Convert timestamp strings back to Date objects
      return notifications.map((n) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  }

  /**
   * Add a new notification
   */
  async addNotification(
    officerId: number,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Notification["metadata"],
  ): Promise<void> {
    try {
      const notifications = await this.getNotifications(officerId);

      const newNotification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type,
        title,
        message,
        timestamp: new Date(),
        read: false,
        metadata,
      };

      // Add to beginning (newest first)
      notifications.unshift(newNotification);

      // Keep only last MAX_NOTIFICATIONS
      const trimmedNotifications = notifications.slice(0, MAX_NOTIFICATIONS);

      const key = this.getOfficerKey(officerId);
      await AsyncStorage.setItem(key, JSON.stringify(trimmedNotifications));
    } catch (error) {
      console.error("Error adding notification:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(officerId: number, notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications(officerId);
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      );

      const key = this.getOfficerKey(officerId);
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(officerId: number): Promise<void> {
    try {
      const notifications = await this.getNotifications(officerId);
      const updated = notifications.map((n) => ({ ...n, read: true }));

      const key = this.getOfficerKey(officerId);
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(officerId: number): Promise<number> {
    const notifications = await this.getNotifications(officerId);
    return notifications.filter((n) => !n.read).length;
  }

  /**
   * Clear all notifications for an officer
   */
  async clearAll(officerId: number): Promise<void> {
    try {
      const key = this.getOfficerKey(officerId);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }

  /**
   * Delete specific notification
   */
  async deleteNotification(
    officerId: number,
    notificationId: string,
  ): Promise<void> {
    try {
      const notifications = await this.getNotifications(officerId);
      const filtered = notifications.filter((n) => n.id !== notificationId);

      const key = this.getOfficerKey(officerId);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }
}

export default new NotificationService();
