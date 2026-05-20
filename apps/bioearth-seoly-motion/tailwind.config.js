/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bio: {
          blue: '#4584ED',
          blueDark: '#223B72',
          sky: '#D9E8FF',
          coral: '#FF7254',
          coralSoft: '#FFE8E1',
          violet: '#8A58E8',
          violetSoft: '#E9DDFF',
          ink: '#303A4B',
          muted: '#7A8495',
          green: '#39B883',
          mint: '#D9F6EA',
          cream: '#FFF6F1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px rgba(48, 58, 75, 0.12)',
        lift: '0 30px 90px rgba(48, 58, 75, 0.18)',
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at 78% 30%, rgba(69,132,237,.38), transparent 28%), radial-gradient(circle at 12% 82%, rgba(255,114,84,.40), transparent 34%), linear-gradient(115deg, #fff7f3 0%, #eaf3ff 50%, #ffffff 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        marqueeLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeRight: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.75' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        marqueeLeft: 'marqueeLeft 24s linear infinite',
        marqueeRight: 'marqueeRight 28s linear infinite',
        pulseDot: 'pulseDot 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
