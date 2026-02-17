/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B2C4D', // Deep Blue
          light: '#2C436F',   // Lighter shade for hover/borders if needed
        },
        secondary: {
          DEFAULT: '#00A29F', // Teal
        },
        accent: {
          DEFAULT: '#804EFF', // Purple
        },
        // Deep Blue Tints (Light greys/whites for text/ui)
        tint: {
          5:  '#F4F4F6', // Almost white
          10: '#E8EAED',
          15: '#DDDFE4',
          20: '#D1D5DB', // Mid grey
          25: '#C6CAD2', // Darker grey
        }
      }
    },
  },
  plugins: [],
}

