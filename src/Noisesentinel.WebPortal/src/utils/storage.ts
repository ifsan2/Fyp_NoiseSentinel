import { STORAGE_KEYS } from './constants';

class StorageService {
  /**
   * Save JWT token
   */
  saveToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  /**
   * Get JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Remove JWT token
   */
  removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Save user data
   */
  saveUserData(userData: any): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }

  /**
   * Get user data
   */
  getUserData(): any | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Remove user data
   */
  removeUserData(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Clear all storage
   */
  clearAll(): void {
    this.removeToken();
    this.removeUserData();
  }
}

export default new StorageService();