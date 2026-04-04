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
};
