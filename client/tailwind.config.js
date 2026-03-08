/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5f7ff",
          100: "#ebf0ff",
          200: "#d6e0ff",
          300: "#b3c7ff",
          400: "#8ca3ff",
          500: "#667eea",
          600: "#5568d3",
          700: "#4451b8",
          800: "#363d94",
          900: "#2d3275",
        },
      },
    },
  },
  plugins: [],
};
