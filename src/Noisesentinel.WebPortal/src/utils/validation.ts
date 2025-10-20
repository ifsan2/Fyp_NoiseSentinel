import { PASSWORD_REGEX, USERNAME_REGEX } from './constants';

export const validation = {
  /**
   * Validate email format
   */
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Validate password strength
   */
  password: (value: string): boolean => {
    return PASSWORD_REGEX.test(value);
  },

  /**
   * Validate username format
   */
  username: (value: string): boolean => {
    return USERNAME_REGEX.test(value);
  },

  /**
   * Validate required field
   */
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  /**
   * Password match validation
   */
  passwordMatch: (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  },
};

export const validationMessages = {
  required: (field: string) => `${field} is required`,
  email: 'Invalid email format',
  password:
    'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  passwordMatch: 'Passwords do not match',
  username: 'Username can only contain letters, numbers, underscores, and hyphens',
  minLength: (field: string, min: number) =>
    `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) =>
    `${field} cannot exceed ${max} characters`,
};