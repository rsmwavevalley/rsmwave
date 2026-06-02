/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0077FF",
        secondary: "#00E5FF",
        accent: "#FFD93D",
        sunset: "#FF6B00",
        pink: "#FF1493",
      },
      backgroundImage: {
        'wave-gradient': 'linear-gradient(135deg, #00E5FF 0%, #0077FF 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #FF6B00 0%, #FF1493 100%)',
        'energy-gradient': 'linear-gradient(135deg, #FFD93D 0%, #FF6B00 100%)',
      }
    }
  },
  plugins: [],
}