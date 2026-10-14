import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        ink: {
          50: "#F5F6F8",
          100: "#E6E8EC",
          200: "#C9CDD5",
          300: "#A2A8B4",
          400: "#7A8291",
          500: "#555D6C",
          600: "#2E3442",
          700: "#20252F",
          800: "#161A22",
          850: "#11141B",
          900: "#0C0E13",
          950: "#07080B",
        },
        nova: {
          50: "#FFF5EB",
          100: "#FFE6CC",
          200: "#FFCB94",
          300: "#FFB066",
          400: "#FF9A3D",
          500: "#FF8A1F",
          600: "#E87300",
          700: "#B85A00",
          800: "#8A4300",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,138,31,.25), 0 10px 40px -10px rgba(255,138,31,.45)",
        card: "0 1px 0 rgba(255,255,255,.04) inset, 0 20px 40px -20px rgba(0,0,0,.6)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.7)", opacity: "0" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "gradient-pan": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.2,0.6,0.4,1) infinite",
        shimmer: "shimmer 1.6s infinite",
        "gradient-pan": "gradient-pan 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
