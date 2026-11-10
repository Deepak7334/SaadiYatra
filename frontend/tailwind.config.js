/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#060B18',
          800: '#0B132B',
          700: '#1C2541',
          600: '#2A3B66',
        },
        gold: {
          50: '#FDF9EC',
          100: '#FAF0CF',
          200: '#F3E19C',
          300: '#ECCF69',
          400: '#E4BF3F',
          500: '#D4AF37', // Brand Champagne Gold
          600: '#B89426',
          700: '#8C6F19',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#FAF6EE',
          300: '#F3EDE2',
        },
        wine: {
          700: '#67001A',
          800: '#800020',
          900: '#5A0017',
        },
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
