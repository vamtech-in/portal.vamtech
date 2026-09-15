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
        canvas: '#F5F4EF',
        surface: '#FFFFFF',
        surfaceSubtle: '#ECEAE4',
        dark: {
          950: '#0a0a0a',
          900: '#111111',
          800: '#181818',
          700: '#222222',
          600: '#333333',
        },
        vamnavy: {
          950: '#070d17',
          900: '#111111', // Updated to match vamtech.in primary dark
          800: '#181818',
          700: '#262626',
          600: '#404040',
          50: '#F5F4EF',
        },
        vamorange: {
          500: '#FF4400', // VAMTech primary punch orange from vamtech.in
          600: '#E63D00',
          400: '#FF6026',
          50: '#FFF4EE',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
