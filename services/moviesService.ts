import { apiFetch } from './authService';
import { API_URL } from '../constants/config';

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProvidersData {
  tmdb_id?: number;
  link?: string | null;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  free?: WatchProvider[];
}

export const moviesService = {
  async getMovieProviders(movieIdOrTmdbId: string | number): Promise<WatchProvidersData | null> {
    try {
      const response = await apiFetch(`${API_URL}/movies/${movieIdOrTmdbId}/providers`, {
        method: 'GET',
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Failed to fetch movie providers:', err);
      return null;
    }
  }
};
