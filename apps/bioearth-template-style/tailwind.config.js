/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bio: {
          blue: '#514BFF',
          blueDark: '#2924C8',
          coral: '#FF6B61',
          coralDark: '#EF4E45',
          lavender: '#F0EFFF',
          ink: '#191C2E',
          muted: '#687082',
          mint: '#9BE7CA',
          green: '#2DBB83',
          cloud: '#FAFBFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 48px rgba(49, 53, 104, 0.12)',
        hover: '0 26px 70px rgba(49, 53, 104, 0.18)',
      },
      backgroundImage: {
        'blue-band': 'linear-gradient(135deg, #514BFF 0%, #443EF0 52%, #6E6AFF 100%)',
        'coral-band': 'linear-gradient(135deg, #FF6B61 0%, #FF7D70 100%)',
        'soft-page': 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 44%, #F0EFFF 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.62', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        fadeUp: 'fadeUp 0.7s ease forwards',
        pulseSoft: 'pulseSoft 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
