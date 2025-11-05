import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        base: {
          100: "#F4F6FF",
          200: "#DDE2FF",
          300: "#B6C2FF",
          400: "#8C9EFF",
          500: "#5C6CFF",
          600: "#3949E5",
          700: "#2733A8",
          800: "#1B2376"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      animation: {
        pulseSoft: "pulseSoft 3s ease-in-out infinite"
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" }
        }
      }
    }
  },
  plugins: []
};

export default config;
