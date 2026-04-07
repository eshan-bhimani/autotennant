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
        "text-primary": "#0F0F0F",
        "text-secondary": "#6B7280",
        "text-muted": "#9CA3AF",
        "card-light": "#F0F2F8",
        "card-light-hover": "#E8ECF5",
        "border-light": "#E5E7EB",
        "nav-bg": "#F9FAFB",
        "nav-border": "#F3F4F6",
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
        "card-inner": "16px",
        chip: "20px",
        icon: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
