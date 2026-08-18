export const defaultVibes = [
    "EXISTENTIAL",
    "MIND_BENDER",
    "ADRENALINE",
    "DATE_NIGHT",
    "DEEP_FEELS",
    "LAUGH_RIOT",
    "SPINE_CHILLING",
    "FAMILY_FUN",
    "HISTORY_LESSON",
    "EPIC_JOURNEY",
    "GUILTY_PLEASURE"
];

export const vibeColors: Record<string, string> = {
    EXISTENTIAL: '#0B4B5C',
    MIND_BENDER: '#7029B8',
    ADRENALINE: '#DD1C1C',
    DATE_NIGHT: '#C22E6C',
    DEEP_FEELS: '#172A57',
    LAUGH_RIOT: '#F5C719',
    SPINE_CHILLING: '#2E4033',
    FAMILY_FUN: '#2699E0',
    HISTORY_LESSON: '#E3AC36',
    EPIC_JOURNEY: '#A17142',
    GUILTY_PLEASURE: '#F06292',
    // Fallback/legacy values
    PIZZA_CHILL: '#60D394',
    INSPIRING: '#F9A826',
    AMBITIOUS: '#9B5DE5',
};

const dynamicVibeColors: Record<string, string> = {};

function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function parseColor(color: string | number[]): string {
    if (Array.isArray(color) && color.length >= 3) {
        return rgbToHex(color[0], color[1], color[2]);
    }
    if (typeof color === 'string') {
        if (color.startsWith('#')) return color;
        const match = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if (match) {
            return rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        }
    }
    return typeof color === 'string' ? color : '#9BA1A6';
}

export function setBackendVibeColors(rawColors: Record<string, string | number[]>): Record<string, string> {
    const normalized: Record<string, string> = {};
    if (!rawColors) return normalized;

    for (const [key, value] of Object.entries(rawColors)) {
        const hex = parseColor(value);
        dynamicVibeColors[key.toUpperCase()] = hex;
        normalized[key.toUpperCase()] = hex;
    }
    return normalized;
}

export function getVibeColor(vibe: string): string {
    const key = vibe.toUpperCase();
    return dynamicVibeColors[key] || vibeColors[key] || '#9BA1A6';
}

export function sanitizeVibesForBackend(vibes: string[]): string[] {
    if (!Array.isArray(vibes)) return [];
    const validSet = new Set(defaultVibes);
    return vibes
        .map(v => typeof v === 'string' ? v.toUpperCase().trim().replace(/[\s-]/g, '_') : '')
        .filter(v => validSet.has(v));
}


