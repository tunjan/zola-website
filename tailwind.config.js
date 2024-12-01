/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  content: ["./templates/**/*.html"],
  theme: {
    fontFamily: {
      'sans': ['IBM Plex Sans'],
      'serif': ['IBM Plex Serif']

    },
    colors: {
      'forest': '#2f3c1d',
      'bark': '#fdf8db',
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      emerald: colors.emerald,
      indigo: colors.indigo,
      yellow: colors.yellow,

    },
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
}

