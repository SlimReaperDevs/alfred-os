/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Alfred OS colour palette
        bg: '#060608',
        surface: '#0e0e12',
        border: '#1a1a24',
        muted: '#4a4a5a',
        text: '#e8e8f0',
        gold: '#c9a84c',
        blue: '#4a9eff',
        cyan: '#00d4ff',
        phase1: '#4a9eff',
        phase2: '#a855f7',
        run: '#22c55e',
        strength: '#ef4444',
        pilates: '#ec4899',
      },
      fontFamily: {
        mono: ['SpaceMono'],
      },
    },
  },
  plugins: [],
};
