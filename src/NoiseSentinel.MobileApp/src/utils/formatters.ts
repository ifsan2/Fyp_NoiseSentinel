import { format, parseISO } from 'date-fns';

export const formatters = {
  /**
   * Format date to readable string
   */
  formatDate: (dateString: string, formatStr: string = 'MMM dd, yyyy'): string => {
    try {
      return format(parseISO(dateString), formatStr);
    } catch (error) {
      return dateString;
    }
  },

  /**
   * Format datetime
   */
  formatDateTime: (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  },

  /**
   * Format currency (PKR)
   */
  formatCurrency: (amount: number): string => {
    return `PKR ${amount.toLocaleString()}`;
  },

  /**
   * Format CNIC (add dashes if missing)
   */
  formatCnic: (cnic: string): string => {
    const cleaned = cnic.replace(/\D/g, '');
    if (cleaned.length === 13) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
    }
    return cnic;
  },

  /**
   * Format sound level
   */
  formatSoundLevel: (level: number): string => {
    return `${level.toFixed(1)} dBA`;
  },

  /**
   * Format time ago
   */
  formatTimeAgo: (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  },
};