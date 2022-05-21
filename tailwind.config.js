module.exports = {
    mode: "jit",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./layouts/**/*.{js,ts,jsx,tsx}",
    ],
    important: true,
    darkMode: "class",
    theme: {
        extend: {
            keyframes: {
                bounce: {
                    "from, 20%, 53%, 80%, to": {
                        transform: "translate3d(0,0,0)",
                    },
                    "40%, 43%": {
                        transform: "translate3d(0, -30px, 0)",
                    },
                    "70%": {
                        transform: "translate3d: (0, -15px, 0)",
                    },
                    "90%": {
                        transform: "translate3d(0,-4px,0)",
                    },
                },
            },
            animation: {
              bounce: "bounce 1s ease-in-out infinite"
            }
        },
        screens: {
            xs: { max: "720px" },
            sm: { max: "1280px", min: "721px" },
            lg: { min: "1280px" },
        },
        neumorphismColor: {
            white: "#FAFAFA",
            slate: {
                900: "rgb(19 27 48)",
            },
        },
    },
    plugins: [require("./styles/neumorphismTWPlugin")],
};
