import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F7CE8",
        "primary-hover": "#3D6AD6",
        "primary-soft": "rgba(79,124,232,0.10)",
        accent: "#7C3AED",
        "accent-teal": "#10B981",
        "accent-amber": "#F59E0B",
        "text-primary": "#0F0F0F",
        "text-secondary": "#6B7280",
        "text-muted": "#9CA3AF",
        "surface-raised": "#FAFBFE",
        "surface-sunken": "#F5F6FA",
        "surface-dark": "#0B1628",
        "surface-darker": "#0A1324",
        "card-light": "#F0F2F8",
        "card-light-hover": "#E8ECF5",
        "border-light": "#E5E7EB",
        "border-subtle": "#F3F4F6",
        "border-strong": "#D1D5DB",
        "nav-bg": "#F9FAFB",
        "nav-border": "#F3F4F6",
        "glass-bg": "rgba(255,255,255,0.72)",
        "glass-border": "rgba(255,255,255,0.18)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "24px",
        btn: "12px",
        input: "10px",
        modal: "20px",
        panel: "16px",
        "card-inner": "16px",
        chip: "20px",
        icon: "12px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        "card-hover": "0 8px 24px rgba(79,124,232,0.10), 0 2px 8px rgba(0,0,0,0.04)",
        glow: "0 0 20px rgba(79,124,232,0.25)",
        "glow-lg": "0 0 40px rgba(79,124,232,0.20)",
        soft: "0 2px 8px rgba(0,0,0,0.05)",
        elevated: "0 12px 40px rgba(0,0,0,0.12)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.5), 0 8px 32px rgba(15,23,42,0.06)",
        "glass-dark": "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.35)",
      },
      backdropBlur: {
        xs: "4px",
        glass: "16px",
        "glass-lg": "20px",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 3s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
