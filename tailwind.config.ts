import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F4EEE1",
          50: "#FCFAF5",
          100: "#F4EEE1",
          200: "#EAE1CC",
          300: "#DDD0B0",
        },
        ink: {
          DEFAULT: "#1C1811",
          900: "#1C1811",
          700: "#4A4234",
          500: "#847A67",
          300: "#B3A990",
        },
        accent: {
          DEFAULT: "#B54E1F",
          100: "#F3DCC7",
          300: "#DE9463",
          600: "#B54E1F",
          700: "#8F3B16",
          900: "#5C260C",
        },
        success: {
          DEFAULT: "#2F6B4F",
          100: "#D9EBE1",
          600: "#2F6B4F",
          700: "#1F4E38",
        },
        error: {
          DEFAULT: "#A23B34",
          100: "#F3DCD9",
          600: "#A23B34",
          700: "#7C2C26",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "reveal-glow": {
          "0%": { boxShadow: "0 0 0 0 rgba(181, 78, 31, 0.0)" },
          "40%": { boxShadow: "0 0 32px 6px rgba(181, 78, 31, 0.35)" },
          "100%": { boxShadow: "0 0 0 0 rgba(181, 78, 31, 0.0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.4s ease-in-out infinite",
        "reveal-glow": "reveal-glow 1.1s ease-out",
        "fade-up": "fade-up 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
