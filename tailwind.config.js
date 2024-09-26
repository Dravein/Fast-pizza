/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      // Így a sans font family-t írja át a tailwindbe. (Egész Conf fájlt átírja így ami fontFamily-re vonatkozik úgy hogy csak a sans lesz benne, ha kiegészíteni akarod a meglévőt extend-be kell tenni)
      sans: "Roboto Mobo, monospace",
      // pizza: "Roboto Mobo, monospace",
    },
    extend: {
      colors: {
        pizza: "#123456",
      },
      fontSize: {
        huge: ["80rem", { lineHeight: "1" }],
      },
      //Standard 100vh helyett hogy tökéletesebb legyen a megjelenítés.
      height: {
        screen: "100dvh",
      },
    },
  },
  plugins: [],
};
