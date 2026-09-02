/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vamnavy: {
          950: '#07111e',
          900: '#0b1f3a', // Base VAMTech dark navy
          800: '#132847',
          700: '#1b3861',
          600: '#274f87',
          500: '#3466ae',
          400: '#4d83cd',
          300: '#79a6e3',
          200: '#afccf3',
          100: '#dbe8fa',
          50: '#f0f5fd',
        },
        vamgold: {
          500: '#e5a93c',
          400: '#f2bd57',
          600: '#c28923',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
