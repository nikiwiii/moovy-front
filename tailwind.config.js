/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            fontFamily: {
                outfit: ['Outfit_400Regular'],
                'outfit-semi': ['Outfit_600SemiBold'],
                'outfit-bold': ['Outfit_700Bold'],
            }
        },
    },
    plugins: [],
};
