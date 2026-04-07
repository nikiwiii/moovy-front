import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'user_token';
const USER_ID_KEY = 'user_id';

export const storageService = {
  async saveToken(token: string) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  async getToken() {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async deleteToken() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  },

  async saveUserId(userId: string) {
    try {
      await SecureStore.setItemAsync(USER_ID_KEY, userId);
    } catch (error) {
      console.error('Error saving user id:', error);
    }
  },

  async getUserId() {
    try {
      return await SecureStore.getItemAsync(USER_ID_KEY);
    } catch (error) {
      console.error('Error getting user id:', error);
      return null;
    }
  },

  async saveLocalPreferences(prefs: any) {
    try {
      await SecureStore.setItemAsync('local_preferences', JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving local preferences:', error);
    }
  },

  async getLocalPreferences() {
    try {
      const prefs = await SecureStore.getItemAsync('local_preferences');
      return prefs ? JSON.parse(prefs) : null;
    } catch (error) {
      console.error('Error getting local preferences:', error);
      return null;
    }
  },

  async logout() {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_ID_KEY)
      ]);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },
};
