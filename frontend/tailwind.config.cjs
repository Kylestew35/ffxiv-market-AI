/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ffblue: {
          light: "#6ecbff",
          DEFAULT: "#3aa9ff",
          dark: "#1d6fbf",
        },
        ffgold: {
          light: "#ffe9a8",
          DEFAULT: "#f6d67a",
          dark: "#c9a74f",
        },
      },
      boxShadow: {
        crystal: "0 0 20px rgba(56, 189, 248, 0.6)",
        gold: "0 0 14px rgba(246, 214, 122, 0.6)",
      },
      backgroundImage: {
        "ffxiv-stars":
          "radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 60%), radial-gradient(circle at bottom, rgba(129,140,248,0.18), transparent 60%)",
      },
      fontFamily: {
        ffxiv: ["'Cinzel'", "serif"],
      },
    },
  },
};

export default config;
