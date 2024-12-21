module.exports = {
  content: ["./templates/**/*.html"],
  theme: {
    fontFamily: {
      sans: ["IBM Plex Sans"],
      serif: ["IBM Plex Serif"],
    },
    extend: {
      animation: {
        "search-icon": "search-icon 0.8s ease-in-out", // Correct keyframes name
      },
      keyframes: {
        "search-icon": { // Correct keyframes name used here
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(10deg) scale(1.1)" },
          "100%": { transform: "rotate(0deg) scale(1)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    function ({ addBase, theme }) {
      addBase({
        ".hide-spin-button": {
          "-moz-appearance": "textfield", // Firefox
        },
        ".hide-spin-button::-webkit-outer-spin-button, .hide-spin-button::-webkit-inner-spin-button": {
          "-webkit-appearance": "none", // Chrome, Safari, Edge
          margin: "0",
        },
      });
    },
  ],
};
