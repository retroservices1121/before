/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        b4e: {
          bg: '#08090b',
          surface: '#0e1014',
          'surface-2': '#14161c',
          'surface-3': '#1a1c24',
          border: '#1e2028',
          'border-accent': '#282a34',
          text: '#e4e4ec',
          'text-dim': '#8a8aa0',
          'text-muted': '#4e5068',
          accent: '#00e59f',
          'accent-dim': 'rgba(0, 229, 159, 0.125)',
          'accent-glow': 'rgba(0, 229, 159, 0.06)',
          warm: '#ff6050',
          amber: '#ffbe2e',
          purple: '#a78bfa',
          blue: '#1d63ed',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Instrument Serif', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
