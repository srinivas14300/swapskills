/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./templates/**/*.{html,js}",
    "./static/**/*.{html,js}",
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        'dropdown-enter': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        'dropdown-enter': 'dropdown-enter 0.2s ease-out',
      }
    }
  },
  plugins: [],
}
