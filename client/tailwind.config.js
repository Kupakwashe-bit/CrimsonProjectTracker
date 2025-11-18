/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5B0E15',
        'primary-dark': '#2B0307',
        background: '#050203',
        surface: '#130506',
        accent: '#F5E6DE',
        'accent-soft': '#F5E6DE0D',
        'text-primary': '#F7F2EE',
        'text-muted': '#B8A7A5',
        success: '#5DD39E',
        warning: '#F0A500',
        danger: '#FF5C5C',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'sans-serif'],
        display: ['Poppins', 'Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        crimson: '0 20px 60px rgba(91, 14, 21, 0.45)',
        'crimson-soft': '0 10px 30px rgba(91, 14, 21, 0.25)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
      },
      transitionTimingFunction: {
        'gentle': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}