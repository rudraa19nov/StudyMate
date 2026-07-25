/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
      },
      colors: {
        // "Sunlit Study" palette — a warm, papery academic theme,
        // deliberately different from the original dark purple/pink app.
        paper: {
          DEFAULT: "#f6f1e4",
          soft: "#efe7d3",
          dark: "#12100c",
        },
        ink: {
          DEFAULT: "#232019",
          muted: "#6b6355",
          inverted: "#f6f1e4",
        },
        forest: {
          50: "#eef5f1",
          100: "#d3e6da",
          300: "#7fb89a",
          500: "#2f6f57",
          600: "#1f4d3d",
          700: "#163a2e",
        },
        amber: {
          100: "#f6dfc4",
          300: "#e2a76f",
          500: "#c2703d",
          600: "#9c5527",
        },
        gold: {
          400: "#e0b23c",
          500: "#c99a2c",
        },
      },
      boxShadow: {
        card: "0 10px 30px rgba(35, 32, 25, 0.08)",
        soft: "0 4px 16px rgba(35, 32, 25, 0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
