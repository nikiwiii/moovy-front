import { storageService } from './storageService';
import { setBackendVibeColors } from '../constants/vibes';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://34.118.42.82:8010';
console.log('[metadataService] API_URL:', API_URL);

export interface PreferencesOptions {
    vibes: string[];
    eras: string[];
    vibe_colors?: Record<string, string>;
}

export const metadataService = {
    /**
     * Fetches metadata preferences options (vibes/genres and eras) from the backend.
     */
    async getPreferencesOptions(): Promise<PreferencesOptions> {
        try {
            const token = await storageService.getToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            };

            const response = await fetch(`${API_URL}/metadata/preferences-options`, {
                method: 'GET',
                headers,
            });

            const text = await response.text();
            let data: any;
            try {
                data = JSON.parse(text);
            } catch {
                data = { detail: text || `Server error (${response.status}: ${response.statusText || 'Internal Error'})` };
            }

            if (!response.ok) {
                throw new Error(data.detail || 'Błąd pobierania metadanych z serwera');
            }

            if (data && data.vibe_colors) {
                const normalizedColors = setBackendVibeColors(data.vibe_colors);
                data.vibe_colors = normalizedColors;
            }
            return data;
        } catch (error) {
            console.error('Failed to fetch preferences options:', error);
            throw error;
        }
    }
};

