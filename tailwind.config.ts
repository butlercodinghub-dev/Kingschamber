import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "/Users/renobutler/Desktop/KINGS CHAMBER APP/kings-chamber/app/**/*.{js,ts,jsx,tsx,mdx}",
    "/Users/renobutler/Desktop/KINGS CHAMBER APP/kings-chamber/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "chamber-black": "#0a0a0a",
        "chamber-dark": "#111111",
        "chamber-gold": "#c9a84c",
        "chamber-gold-light": "#e8c96d",
        "chamber-warm-white": "#f5f0e8",
        "chamber-muted": "#8a7a5a",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
