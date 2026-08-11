import { apiFetch } from './authService';
import { storageService } from './storageService';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://34.118.42.82:8010';

export interface WatchlistMovie {
    movie_id: string;
    title: string;
    poster_path: string;
    runtime: number | null;
    genre: string[] | null;
    release_date: string | null;
}

export interface RatingHistoryItem {
    movie_id: string;
    title: string;
    poster_path: string;
    status: string;
}

function extractErrorMsg(data: any, defaultMsg: string): string {
    if (!data) return defaultMsg;
    const detail = data.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
        return detail.map((e: any) => {
            if (e && typeof e === 'object') {
                const field = e.loc ? `${e.loc.slice(1).join('.')}: ` : '';
                return `${field}${e.msg || JSON.stringify(e)}`;
            }
            return String(e);
        }).join('\n');
    }
    if (detail && typeof detail === 'object') return JSON.stringify(detail);
    if (data.message) return String(data.message);
    return defaultMsg;
}

async function parseResponse(response: Response) {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { detail: text || `Server error (${response.status}: ${response.statusText || 'Internal Error'})` };
    }
}

export const ratingService = {
    async rateMovie(movieId: string, status: 'LOVE' | 'LIKE' | 'DISLIKE' | 'HATE' | 'WATCHED' | 'WATCHLIST'): Promise<any> {
        const response = await apiFetch(`${API_URL}/rating/rate`, {
            method: 'POST',
            body: JSON.stringify({ movie_id: movieId, status }),
        });

        const data = await parseResponse(response);
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Error rating movie'));
        }
        return data;
    },

    async rateMovieByPath(movieId: string, status: 'LOVE' | 'LIKE' | 'DISLIKE' | 'HATE' | 'WATCHED' | 'WATCHLIST'): Promise<any> {
        const response = await apiFetch(`${API_URL}/rating/rate/${encodeURIComponent(movieId)}/${encodeURIComponent(status)}`, {
            method: 'POST',
        });

        const data = await parseResponse(response);
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Error rating movie by path'));
        }
        return data;
    },

    async addToWatchlist(movieId: string): Promise<any> {
        const response = await apiFetch(`${API_URL}/rating/watchlist/${encodeURIComponent(movieId)}`, {
            method: 'POST',
        });

        const data = await parseResponse(response);
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Error adding to watchlist'));
        }
        return data;
    },

    async removeFromWatchlist(movieId: string): Promise<any> {
        const response = await apiFetch(`${API_URL}/rating/watchlist/${encodeURIComponent(movieId)}`, {
            method: 'DELETE',
        });

        const data = await parseResponse(response);
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Error removing from watchlist'));
        }
        return data;
    },

    async unrateMovie(movieId: string, status: string): Promise<any> {
        const response = await apiFetch(`${API_URL}/rating/rate/${encodeURIComponent(movieId)}`, {
            method: 'DELETE',
        });

        const data = await parseResponse(response);
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Error removing rating'));
        }
        return data;
    },

    async getWatchlist(): Promise<WatchlistMovie[]> {
        const response = await apiFetch(`${API_URL}/rating/watchlist`, {
            method: 'GET',
        });

        const data = await parseResponse(response);
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Error fetching watchlist'));
        }
        return data;
    },

    async getHistory(): Promise<RatingHistoryItem[]> {
        const response = await apiFetch(`${API_URL}/rating/history`, {
            method: 'GET',
        });

        const data = await parseResponse(response);
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Error fetching history'));
        }
        return data;
    }
};
