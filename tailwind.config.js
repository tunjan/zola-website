/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.html"],
  theme: {
    fontFamily: {
      sans: ["IBM Plex Sans"],
      serif: ["IBM Plex Serif"],
    },
    extend: {
      animation: {
        "search-icon": "search-icon 0.8s ease-in-out",
      },
      keyframes: {
        "search-icon-animation": {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(10deg) scale(1.1)" },
          "100%": { transform: "rotate(0deg) scale(1)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
