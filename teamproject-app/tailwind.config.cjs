/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        'primary-hover': '#4338ca',
        secondary: '#64748b',
        background: '#f8fafc',
        surface: '#ffffff',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
      },
    },
  },
  plugins: [],
};
