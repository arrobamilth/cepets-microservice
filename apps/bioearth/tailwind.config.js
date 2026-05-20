/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bio: {
          navy: '#06223f',
          blue: '#0b4f8a',
          cyan: '#16a6c9',
          aqua: '#9adbe8',
          green: '#69c39b',
          mint: '#d9f4ea',
          ink: '#10243d',
          cloud: '#f5fbff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(7, 45, 82, 0.12)',
        lift: '0 24px 70px rgba(7, 45, 82, 0.18)',
      },
      backgroundImage: {
        'blue-glow': 'linear-gradient(135deg, #06223f 0%, #0b4f8a 48%, #16a6c9 100%)',
        'section-wash':
          'linear-gradient(180deg, rgba(245, 251, 255, 0.92) 0%, rgba(255,255,255,1) 100%)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.75s ease forwards',
        floatSlow: 'floatSlow 5s ease-in-out infinite',
        scan: 'scan 6s linear infinite',
      },
    },
  },
  plugins: [],
};
