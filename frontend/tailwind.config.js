/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#f97316', // Orange-500
                    dark: '#ea580c',    // Orange-600
                    light: '#fb923c',   // Orange-400
                },
                secondary: '#1e293b', // Slate-800
                accent: '#f59e0b',    // Amber-500
                background: '#0f172a', // Slate-900
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'slideDown': 'slideDown 0.5s ease-out',
            },
            keyframes: {
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
