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

export function getVibeColor(vibe: string): string {
    return vibeColors[vibe.toUpperCase()] || '#9BA1A6';
}

