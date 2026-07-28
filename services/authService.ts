import { storageService } from './storageService';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://34.118.42.82:8010';
console.log('[authService] API_URL:', API_URL);

function extractErrorMessage(data: any, fallback: string): string {
  if (!data || !data.detail) return fallback;
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
  }
  return JSON.stringify(data.detail);
}

async function parseResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text || `Server error (${response.status}: ${response.statusText || 'Internal Error'})` };
  }
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, options);
}

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(extractErrorMessage(data, 'Login error'));
      }

      if (data.access_token) {
        await storageService.saveToken(data.access_token);
      }
      if (data.refresh_token) {
        await storageService.saveRefreshToken(data.refresh_token);
      }
      if (data.user_id) {
        await storageService.saveUserId(data.user_id);
      }

      return data;
    } catch (error: any) {
      console.error('[authService] login error:', error, 'URL was:', `${API_URL}/auth/login`);
      throw new Error(error.message || 'Server connection error');
    }
  },

  async register(email: string, password: string, confirmPassword: string) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, confirm_password: confirmPassword }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(extractErrorMessage(data, 'Registration error'));
      }

      if (data.access_token) {
        await storageService.saveToken(data.access_token);
      }
      if (data.refresh_token) {
        await storageService.saveRefreshToken(data.refresh_token);
      }

      return data;
    } catch (error: any) {
      console.error('[authService] register error:', error, 'URL was:', `${API_URL}/auth/register`);
      throw new Error(error.message || 'Server connection error');
    }
  },

  async refreshToken() {
    try {
      const storedRefreshToken = await storageService.getRefreshToken();
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(extractErrorMessage(data, 'Session expired. Please log in again.'));
      }

      if (data.access_token) {
        await storageService.saveToken(data.access_token);
      }
      if (data.refresh_token) {
        await storageService.saveRefreshToken(data.refresh_token);
      }

      return data;
    } catch (error: any) {
      console.error('[authService] refreshToken error:', error);
      throw error;
    }
  },

  async deleteAccount(refreshToken: string) {
    try {
      const response = await fetch(`${API_URL}/auth/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(extractErrorMessage(data, 'Failed to delete account'));
      }

      return data;
    } catch (error: any) {
      console.error('[authService] deleteAccount error:', error);
      throw new Error(error.message || 'Server connection error');
    }
  },
};

