import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { AuthResponseDto } from "../models/Auth";
import { STORAGE_KEYS } from "../utils/constants";

type WebStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const getWebStorage = (): WebStorage | null => {
  const storage = (globalThis as { localStorage?: WebStorage }).localStorage;
  return storage ?? null;
};

class StorageService {
  // Secure storage for sensitive values like tokens
  private async setSecureItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      getWebStorage()?.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  private async getSecureItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return getWebStorage()?.getItem(key) ?? null;
    } else {
      return await SecureStore.getItemAsync(key);
    }
  }

  private async removeSecureItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      getWebStorage()?.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }

  // General storage for larger non-sensitive payloads
  private async setGeneralItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      getWebStorage()?.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  }

  private async getGeneralItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return getWebStorage()?.getItem(key) ?? null;
    } else {
      return await AsyncStorage.getItem(key);
    }
  }

  private async removeGeneralItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      getWebStorage()?.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }

  // Save JWT token
  async saveToken(token: string): Promise<void> {
    try {
      await this.setSecureItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error("Error saving token:", error);
      throw error;
    }
  }

  // Get JWT token
  async getToken(): Promise<string | null> {
    try {
      return await this.getSecureItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  // Remove JWT token
  async removeToken(): Promise<void> {
    try {
      await this.removeSecureItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }

  // Save user data
  async saveUserData(userData: AuthResponseDto): Promise<void> {
    try {
      await this.setGeneralItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData),
      );
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    }
  }

  // Get user data
  async getUserData(): Promise<AuthResponseDto | null> {
    try {
      const data = await this.getGeneralItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  // Remove user data
  async removeUserData(): Promise<void> {
    try {
      await this.removeGeneralItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error("Error removing user data:", error);
    }
  }

  // Save remember me preference
  async saveRememberMe(remember: boolean): Promise<void> {
    try {
      await this.setGeneralItem(STORAGE_KEYS.REMEMBER_ME, remember.toString());
    } catch (error) {
      console.error("Error saving remember me:", error);
    }
  }

  // Get remember me preference
  async getRememberMe(): Promise<boolean> {
    try {
      const value = await this.getGeneralItem(STORAGE_KEYS.REMEMBER_ME);
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
