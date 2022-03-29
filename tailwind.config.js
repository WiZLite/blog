module.exports = {
  mode: "jit",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}"
  ],
  important: true,
  darkMode: "class",
  theme: {
    extend: {},
    screens: {
      "xs": {"max": "720px"},
      "sm": {"max": "1280px", "min": "721px"},
      "lg": {"min": "1280px"}
    },
    neumorphismColor: {
      white: "#FAFAFA",
      slate: {
        900: "rgb(19 27 48)"
      }
    }
  },
  plugins: [require("./styles/neumorphismTWPlugin")],
}
