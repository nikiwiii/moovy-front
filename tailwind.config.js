const appColors = require("./constants/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./constants/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                background: {
                    DEFAULT: appColors.background,
                    dark: appColors.backgroundDark,
                },
                accent: {
                    DEFAULT: appColors.accent,
                    dim: appColors.accentDim,
                },
                card: {
                    DEFAULT: appColors.card,
                    active: appColors.cardActive,
                },
                text: {
                    DEFAULT: appColors.text,
                    muted: appColors.textMuted,
                    dim: appColors.textDim,
                    secondary: appColors.textSecondary,
                }
            },
            fontFamily: {
                outfit: ['Outfit_400Regular'],
                'outfit-semi': ['Outfit_600SemiBold'],
                'outfit-bold': ['Outfit_700Bold'],
            }
        },
    },
    plugins: [
        ({ addBase }) => {
            addBase({
                ":root": {
                    "--color-text": appColors.text,
                    "--color-background": appColors.background,
                    "--color-background-dark": appColors.backgroundDark,
                    "--color-accent": appColors.accent,
                    "--color-accent-dim": appColors.accentDim,
                    "--color-card": appColors.card,
                    "--color-card-active": appColors.cardActive,
                    "--color-text-muted": appColors.textMuted,
                    "--color-text-dim": appColors.textDim,
                    "--color-text-secondary": appColors.textSecondary,
                },
            });
        },
    ],
};
