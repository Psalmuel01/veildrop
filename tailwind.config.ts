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
          DEFAULT: "#03191E",
          50: "#0A2830",
          100: "#03191E",
          200: "#123640",
          300: "#1B4650",
        },
        ink: {
          DEFAULT: "#EAF6F7",
          900: "#EAF6F7",
          700: "#9FC7CC",
          500: "#6B939A",
          300: "#3E5D62",
        },
        accent: {
          DEFAULT: "#DB6FB0",
          100: "#2A1520",
          300: "#E8A3CB",
          600: "#DB6FB0",
          700: "#C25A9B",
          900: "#7A2F58",
        },
        success: {
          DEFAULT: "#3ED9A0",
          100: "#0F3328",
          600: "#3ED9A0",
          700: "#2AB483",
        },
        error: {
          DEFAULT: "#FF8A80",
          100: "#3A1416",
          600: "#FF8A80",
          700: "#E85A4F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "reveal-glow": {
          "0%": { boxShadow: "0 0 0 0 rgba(219, 111, 176, 0.0)" },
          "40%": { boxShadow: "0 0 32px 6px rgba(219, 111, 176, 0.35)" },
          "100%": { boxShadow: "0 0 0 0 rgba(219, 111, 176, 0.0)" },
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
