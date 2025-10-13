import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { AuthResponseDto } from "../models/Auth";
import { STORAGE_KEYS } from "../utils/constants";

class StorageService {
  // Platform-aware storage helpers
  private async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  private async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  }

  private async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }

  // Save JWT token
  async saveToken(token: string): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error("Error saving token:", error);
      throw error;
    }
  }

  // Get JWT token
  async getToken(): Promise<string | null> {
    try {
      return await this.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  // Remove JWT token
  async removeToken(): Promise<void> {
    try {
      await this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }

  // Save user data
  async saveUserData(userData: AuthResponseDto): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    }
  }

  // Get user data
  async getUserData(): Promise<AuthResponseDto | null> {
    try {
      const data = await this.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  // Remove user data
  async removeUserData(): Promise<void> {
    try {
      await this.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error("Error removing user data:", error);
    }
  }

  // Save remember me preference
  async saveRememberMe(remember: boolean): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.REMEMBER_ME, remember.toString());
    } catch (error) {
      console.error("Error saving remember me:", error);
    }
  }

  // Get remember me preference
  async getRememberMe(): Promise<boolean> {
    try {
      const value = await this.getItem(STORAGE_KEYS.REMEMBER_ME);
      return value === "true";
    } catch (error) {
      console.error("Error getting remember me:", error);
      return false;
    }
  }

  // Clear all storage
  async clearAll(): Promise<void> {
    try {
      await this.removeToken();
      await this.removeUserData();
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }
}

export default new StorageService();
