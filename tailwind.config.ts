import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        foreground: "var(--fg)",
        card:       "var(--card)",
        surface:    "var(--surface)",
        border:     "var(--border)",
        "muted-foreground": "var(--muted)",
        ink:    "#08080d",
        cream:  "#ede9df",
        accent: "#c9955c",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
