import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        court: {
          50: "#F7F9F7",
          100: "#EFF5F1",
          200: "#DDE5E1",
          300: "#C7D3CD",
          500: "#12B76A",
          600: "#078D50",
          900: "#10201B"
        },
        ink: {
          500: "#5B6863",
          600: "#3F4D48",
          700: "#263630"
        },
        shuttle: "#FACC15",
        info: "#2563EB",
        warning: "#F97316",
        danger: "#DC2626"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(16, 32, 27, 0.08)",
        lift: "0 24px 70px rgba(16, 32, 27, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
