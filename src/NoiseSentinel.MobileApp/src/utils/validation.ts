export const validation = {
  /**
   * Validate CNIC format (12345-1234567-1)
   */
  cnic: (value: string): boolean => {
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
    return cnicRegex.test(value);
  },

  /**
   * Validate plate number format (PK-ABC-123)
   */
  plateNumber: (value: string): boolean => {
    const plateRegex = /^[A-Z0-9-]+$/;
    return plateRegex.test(value);
  },

  /**
   * Validate phone number
   */
  phoneNumber: (value: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(value) && value.length >= 10;
  },

  /**
   * Validate email
   */
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Validate password strength
   */
  password: (value: string): boolean => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(value);
  },

  /**
   * Validate required field
   */
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },
};