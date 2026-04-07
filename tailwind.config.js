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
                    DEFAULT: "var(--color-background)",
                    dark: "var(--color-background-dark)",
                },
                accent: {
                    DEFAULT: "var(--color-accent)",
                    dim: "var(--color-accent-dim)",
                },
                card: {
                    DEFAULT: "var(--color-card)",
                    active: "var(--color-card-active)",
                },
                text: {
                    DEFAULT: "var(--color-text)",
                    muted: "var(--color-text-muted)",
                    dim: "var(--color-text-dim)",
                    secondary: "var(--color-text-secondary)",
                }
            },
            fontFamily: {
                outfit: ['Outfit_400Regular'],
                'outfit-semi': ['Outfit_600SemiBold'],
                'outfit-bold': ['Outfit_700Bold'],
            }
        },
    },
    plugins: [],
};
