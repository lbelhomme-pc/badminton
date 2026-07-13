import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Rajdhani", "Arial Narrow", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      colors: {
        cfvv: {
          turquoise: "#0C8A9C",
          action: "#0B7F90",
          actionDark: "#076B79",
          anthracite: "#1D1D1F",
          white: "#FFFFFF"
        },
        court: {
          50: "#F2FAFB",
          100: "#E2F3F5",
          200: "#C4E6EA",
          300: "#8CCBD4",
          500: "#0B7F90",
          600: "#076B79",
          700: "#075866",
          900: "#1D1D1F"
        },
        ink: {
          500: "#5D6365",
          600: "#42484A",
          700: "#2F3335"
        },
        shuttle: "#F2C94C",
        info: "#2563EB",
        warning: "#F97316",
        danger: "#DC2626"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(29, 29, 31, 0.08)",
        lift: "0 24px 70px rgba(29, 29, 31, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
