/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          red: '#ff0055',
          blue: '#00d9ff',
          pink: '#ff006e',
          purple: '#8b00ff',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'retro-grid': 'linear-gradient(0deg, rgba(255,0,85,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,85,0.1) 1px, transparent 1px)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fog': 'fog 20s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,0,85,0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255,0,85,0.8), 0 0 60px rgba(0,217,255,0.4)' },
        },
        fog: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)', opacity: '0.3' },
          '50%': { transform: 'translateX(100px) translateY(-50px)', opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
