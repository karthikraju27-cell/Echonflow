import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: "#1B3328",
        ink: "#17251C",
        moss: "#4F7A5B",
        gold: "#D9A441",
        mist: "#EFEBDD",
        card: "#F7F4EA",
      },
      fontFamily: {
        display: ["var(--font-newsreader)", "Georgia", "serif"],
        body: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "eflow-drift": {
          "0%": { transform: "translateX(-8vw) translateY(0px) rotate(-6deg)", opacity: "0" },
          "8%": { opacity: "0.9" },
          "50%": { transform: "translateX(55vw) translateY(-18px) rotate(6deg)" },
          "92%": { opacity: "0.9" },
          "100%": { transform: "translateX(112vw) translateY(6px) rotate(-4deg)", opacity: "0" },
        },
        "eflow-flap": {
          from: { transform: "scaleX(1)" },
          to: { transform: "scaleX(0.55)" },
        },
      },
      animation: {
        "eflow-drift": "eflow-drift 16s linear infinite",
        "eflow-flap": "eflow-flap 0.5s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};
export default config;
