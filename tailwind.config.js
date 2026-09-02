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
          950: '#070d17',
          900: '#0f172a', // VAMTech primary dark navy
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          50: '#f8fafc',
        },
        vamorange: {
          500: '#f9572a', // VAMTech signature orange
          600: '#e0461b',
          400: '#ff6f47',
          50: '#fff5f2',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
