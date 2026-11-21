/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'handwriting': ['"Patrick Hand"', '"Shadows Into Light"', 'cursive'],
        'body': ['"Open Sans"', '"Roboto"', 'sans-serif']
      },
      colors: {
        cork: {
          light: '#C19A6B',
          dark: '#B8956A'
        },
        wood: {
          light: '#A0522D',
          dark: '#8B4513'
        },
        sticky: {
          yellow: '#FFF740',
          pink: '#FFB6C1',
          blue: '#B4E7F8',
          green: '#BDFFA4'
        }
      }
    },
  },
  plugins: [],
}