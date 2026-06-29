/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#1A1D1F',
        'charcoal-raised': '#23262A',
        offwhite: '#F7F5F0',
        amber: '#D4632C',
        'amber-bright': '#E07A42',
        sage: '#8A9A8E',
        rust: '#C2483A',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
