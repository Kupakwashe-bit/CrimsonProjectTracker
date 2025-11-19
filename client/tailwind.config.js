/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00E0C6', // Cyan/Teal
        'primary-dark': '#00B29D',
        background: '#020617', // Dark Void
        surface: '#0F172A', // Dark Navy
        accent: '#22D3EE', // Bright Cyan
        'accent-soft': '#22D3EE1A',
        'text-primary': '#F1F5F9', // Slate 100
        'text-muted': '#94A3B8', // Slate 400
        success: '#4ADE80',
        warning: '#FBBF24',
        danger: '#F87171',
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