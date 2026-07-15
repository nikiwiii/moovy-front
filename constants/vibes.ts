export const defaultVibes = [
    "PIZZA_CHILL",
    "MIND_BENDER",
    "ADRENALINE",
    "DATE_NIGHT",
    "DEEP_FEELS",
    "LAUGH_RIOT",
    "SPINE_CHILLING",
    "FAMILY_FUN",
    "INSPIRING",
    "EPIC_JOURNEY",
    "GUILTY_PLEASURE",
    "AMBITIOUS"
];

export const vibeColors: Record<string, string> = {
    PIZZA_CHILL: '#60D394',
    FAMILY_FUN: '#60D394',
    LAUGH_RIOT: '#FFD166',
    GUILTY_PLEASURE: '#FFD166',
    INSPIRING: '#F9A826',
    EPIC_JOURNEY: '#FF6B35',
    DATE_NIGHT: '#EF476F',
    DEEP_FEELS: '#457B9D',
    MIND_BENDER: '#9B5DE5',
    AMBITIOUS: '#9B5DE5',
    ADRENALINE: '#FF6B35',
    SPINE_CHILLING: '#2D6A4F',
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


