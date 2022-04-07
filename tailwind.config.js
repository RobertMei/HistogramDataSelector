const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [...defaultTheme.fontFamily.sans],
      },
      colors: {
        'gold-300': 'rgb(241,193,55)',
        'gold-400': 'rgb(239,184,24)',
        'gold-500': 'rgb(225,172,20)',
        'gold-600': 'rgb(217,165,16)',
        'blue-100': 'rgb(141,183,211)',
        'blue-200': 'rgb(111,163,199)',
        'blue-300': 'rgb(43,123,177)',
        'blue-400': 'rgb(37,108,156)',
        'blue-500': 'rgb(33,92,134)',
        'blue-600': 'rgb(28,80,117)',
        'blue-700': 'rgb(30,74,110)',
        'blue-800': 'rgb(21,65,96)',
        'blue-900': 'rgb(17,52,75)',
        'blue-aivis-drop': 'rgb(43,127,210)',
        'blue-aivis-drop-light': 'rgb(82,159,235)',
        'orange-400': 'rgb(234,131,66)',
        'orange-500': 'rgb(237,236,1)',
        'green-400': 'rgb(88,158,88)',
        'green-500': 'rgb(86,195,94)', //'rgb(68,160,68)',
        'green-600': 'rgb(66,127,66)',
        'beige-500': 'rgb(201,157,57)',
      },

      backgroundColor: ['active'],
    },
  },

  variants: {
    opacity: ['responsive', 'hover', 'focus', 'disabled'],
    extend: {
      fontWeight: ['hover', 'focus'],
      opacity: ['disabled'],
      backgroundColor: ['active'],
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
