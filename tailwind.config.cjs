/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#12101D',
          text: '#EAE6F8',
        },
        secondary: {
          bg: 'rgba(28, 25, 41, 0.75)',
          text: '#A09CB8',
        },
        border: '#3A3651',
        danger: '#E05A5A',
        success: '#5AE08A'
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      }
    }
  },
  plugins: [],
};
