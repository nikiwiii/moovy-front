import { storageService } from './storageService';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type MeetingType = 'RANDKA' | 'EKIPA' | 'RODZINA' | 'SOLO';
export type MemberStatus = 'pending' | 'ready';
export type SessionStatus = 'LOBBY' | 'ALL_READY' | 'RECOMMENDING' | 'COMPLETED';

export interface SessionPreferences {
    vibes: string[];
    hard_nos: string[];
    max_runtime: number;
    allow_seen: boolean;
    eras: string[];
}

export interface SessionMember {
    user_id: string;
    user_name: string;
    status: MemberStatus;
    preferences: SessionPreferences | null;
}

export interface SessionResponse {
    session_id: string;
    host_id: string;
    invite_code: string;
    meeting_type: MeetingType;
    status: SessionStatus;
    members: SessionMember[];
    recommendations: any[] | null;
    created_at: string | null;
}

export interface CreateSessionResponse {
    session_id: string;
    invite_code: string;
    meeting_type: MeetingType;
}

export interface JoinSessionResponse {
    message: string;
    session_id: string;
    meeting_type: MeetingType;
}

export interface PreferencesResponse {
    message: string;
    all_ready: boolean;
    session_status: SessionStatus;
}

export interface RecommendResponse {
    message: string;
    session_id: string;
    room_session_id: string;
    recommendations: any[];
}

async function getHeaders(): Promise<Record<string, string>> {
    const token = await storageService.getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
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

export const sessionService = {
    /**
     * 1. POST /session/create — Host tworzy sesję
     */
    async createSession(meetingType: MeetingType): Promise<CreateSessionResponse> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/session/create`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ meeting_type: meetingType }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Błąd tworzenia sesji'));
        }
        return data;
    },

    /**
     * 2. POST /session/join — Dołącz do sesji kodem
     */
    async joinSession(inviteCode: string): Promise<JoinSessionResponse> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/session/join`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ invite_code: inviteCode }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Błąd dołączania do sesji'));
        }
        return data;
    },

    /**
     * 3. PUT /session/{session_id}/preferences — Zapisz preferencje
     */
    async setPreferences(sessionId: string, preferences: SessionPreferences): Promise<PreferencesResponse> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/session/${sessionId}/preferences`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ preferences }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Błąd zapisywania preferencji'));
        }
        return data;
    },

    /**
     * 4. GET /session/{session_id} — Pobierz stan sesji
     */
    async getSession(sessionId: string): Promise<SessionResponse> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/session/${sessionId}`, {
            method: 'GET',
            headers,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Błąd pobierania sesji'));
        }
        return data;
    },

    /**
     * 4.5. GET /session/my — Pobierz otwarte sesje użytkownika
     */
    async getMySessions(): Promise<SessionResponse[]> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/session/user/sessions`, {
            method: 'GET',
            headers,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Błąd pobierania moich sesji'));
        }
        return data;
    },

    /**
     * 5. POST /session/{session_id}/recommend — Wywołaj rekomendacje (host only)
     */
    async triggerRecommendations(sessionId: string): Promise<RecommendResponse> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/session/${sessionId}/recommend`, {
            method: 'POST',
            headers,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Błąd generowania rekomendacji'));
        }
        return data;
    },

    /**
     * 6. DELETE /session/{session_id} — Zamknij sesję (host only)
     */
    async deleteSession(sessionId: string): Promise<{ message: string; session_id: string }> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/session/${sessionId}`, {
            method: 'DELETE',
            headers,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(extractErrorMsg(data, 'Błąd zamykania sesji'));
        }
        return data;
    },
};
