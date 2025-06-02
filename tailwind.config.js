/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        darkPurple: {
          50: "#f5f3f8",
          100: "#e5dbf3",
          200: "#c8b5e8",
          300: "#a78ad8",
          400: "#865bc9",
          500: "#6b39b7",
          600: "#542d92",
          700: "#40246f",
          800: "#2c1a4d",
          900: "#1b102f",
          950: "#120a21",
        },
      },
    },
  },
  plugins: [],
};
