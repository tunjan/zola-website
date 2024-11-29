/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.html"],
  theme: {
    fontFamily: {
      'sans': ['Inter']
    },
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
}

