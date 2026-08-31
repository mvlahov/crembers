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
        ink: "#0b1f33",     // deep navy — primary text
        sea: "#12557e",     // nautical blue — accent
        deep: "#0a3450",     // darker accent for hovers
        foam: "#f4f7f9",     // light section background
        sand: "#c8862d",     // warm brass secondary accent
        mist: "#5b6b7a",     // muted slate text
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
