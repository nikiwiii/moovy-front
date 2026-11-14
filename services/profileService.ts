import { apiFetch } from './authService';
import { storageService } from './storageService';
import { API_URL } from '../constants/config';

export interface UserProfile {
  user_id: string;
  email: string;
  nickname: string | null;
  profile_picture: string | null;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text || `Server error (${response.status}: ${response.statusText || 'Internal Error'})` };
  }
}

function extractErrorMessage(data: any, fallback: string): string {
  if (!data || !data.detail) return fallback;
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
  }
  return JSON.stringify(data.detail);
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiFetch(`${API_URL}/profile/me`, {
      method: 'GET',
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error(extractErrorMessage(data, 'Error fetching profile'));
    }
    return data;
  },

  async updateNickname(nickname: string): Promise<{ message: string; nickname: string }> {
    const response = await apiFetch(`${API_URL}/profile/nickname`, {
      method: 'PUT',
      body: JSON.stringify({ nickname }),
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error(extractErrorMessage(data, 'Error updating nickname'));
    }
    return data;
  },

  async updateProfilePicture(base64Image: string): Promise<{ message: string }> {
    const response = await apiFetch(`${API_URL}/profile/picture`, {
      method: 'PUT',
      body: JSON.stringify({ profile_picture: base64Image }),
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error(extractErrorMessage(data, 'Error updating profile picture'));
    }
    return data;
  },

  async deleteProfilePicture(): Promise<{ message: string }> {
    const response = await apiFetch(`${API_URL}/profile/picture`, {
      method: 'DELETE',
    });

    const data = await parseResponse(response);
    if (!response.ok) {
      throw new Error(extractErrorMessage(data, 'Error removing profile picture'));
    }
    return data;
  },
};
