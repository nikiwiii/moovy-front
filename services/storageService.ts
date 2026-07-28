import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'user_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ID_KEY = 'user_id';
const USER_EMAIL_KEY = 'user_email';
const LOCAL_PREFS_KEY = 'local_preferences';

const isWeb = Platform.OS === 'web';

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export const storageService = {
  async saveToken(token: string) {
    try {
      await setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  async getToken() {
    try {
      return await getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async deleteToken() {
    try {
      await deleteItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  },

  async saveRefreshToken(token: string) {
    try {
      await setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
  },

  async getRefreshToken() {
    try {
      return await getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  async deleteRefreshToken() {
    try {
      await deleteItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error deleting refresh token:', error);
    }
  },

  async saveUserId(userId: string) {
    try {
      await setItem(USER_ID_KEY, userId);
    } catch (error) {
      console.error('Error saving user id:', error);
    }
  },

  async getUserId() {
    try {
      return await getItem(USER_ID_KEY);
    } catch (error) {
      console.error('Error getting user id:', error);
      return null;
    }
  },

  async saveUserEmail(email: string) {
    try {
      await setItem(USER_EMAIL_KEY, email);
    } catch (error) {
      console.error('Error saving user email:', error);
    }
  },

  async getUserEmail() {
    try {
      return await getItem(USER_EMAIL_KEY);
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  },

  async saveLocalPreferences(prefs: any) {
    try {
      await setItem(LOCAL_PREFS_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving local preferences:', error);
    }
  },

  async getLocalPreferences() {
    try {
      const prefs = await getItem(LOCAL_PREFS_KEY);
      return prefs ? JSON.parse(prefs) : null;
    } catch (error) {
      console.error('Error getting local preferences:', error);
      return null;
    }
  },

  async logout() {
    try {
      await Promise.all([
        deleteItem(TOKEN_KEY),
        deleteItem(REFRESH_TOKEN_KEY),
        deleteItem(USER_ID_KEY),
        deleteItem(USER_EMAIL_KEY),
      ]);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },
};
