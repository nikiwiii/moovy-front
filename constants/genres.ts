export const genreColors: Record<string, string> = {
    "Action": "#FF6B35",          // Vibrant orange
    "Adventure": "#FFB627",       // Gold
    "Animation": "#FF9F1C",       // Warm orange-yellow
    "Comedy": "#FFD166",          // Pastel yellow
    "Crime": "#4A4E69",           // Dark slate blue/grey
    "Documentary": "#4A90E2",     // Calm blue
    "Drama": "#457B9D",           // Steel blue
    "Family": "#60D394",          // Pastel green
    "Fantasy": "#9B5DE5",          // Magic purple
    "History": "#8D6E63",          // Warm brown
    "Horror": "#2D6A4F",           // Dark forest green
    "Music": "#EF476F",           // Rose pink
    "Mystery": "#7209B7",          // Deep indigo
    "Romance": "#EF476F",          // Bright pink/red
    "Science Fiction": "#3A86C8",  // Cosmic blue
    "Sci-Fi": "#3A86C8",           // Cosmic blue
    "TV Movie": "#9E9E9E",         // Grey
    "Thriller": "#D90429",         // Crimson red
    "War": "#556B2F",              // Olive green
    "Western": "#C17C30",          // Dust/clay orange
};

export function getGenreColor(genre: string): string {
    const key = genre.trim();
    if (genreColors[key]) return genreColors[key];
    
    // Case insensitive search
    const lowerKey = key.toLowerCase();
    const foundKey = Object.keys(genreColors).find(k => k.toLowerCase() === lowerKey);
    if (foundKey) return genreColors[foundKey];

    return '#9BA1A6'; // Default fallback grey
}