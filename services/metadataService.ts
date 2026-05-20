import { storageService } from './storageService';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface PreferencesOptions {
    vibes: string[];
    eras: string[];
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

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Błąd pobierania metadanych z serwera');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch preferences options:', error);
            throw error;
        }
    }
};
