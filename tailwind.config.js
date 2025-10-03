/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Glass design system
      colors: {
        glass: {
          white: {
            5: 'rgba(255, 255, 255, 0.05)',
            10: 'rgba(255, 255, 255, 0.10)',
            15: 'rgba(255, 255, 255, 0.15)',
            20: 'rgba(255, 255, 255, 0.20)',
            30: 'rgba(255, 255, 255, 0.30)',
            50: 'rgba(255, 255, 255, 0.50)',
          },
          dark: {
            5: 'rgba(0, 0, 0, 0.05)',
            10: 'rgba(0, 0, 0, 0.10)',
            20: 'rgba(0, 0, 0, 0.20)',
            30: 'rgba(0, 0, 0, 0.30)',
          }
        }
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '80px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-lg': '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        'orb': '0 8px 32px rgba(255, 255, 255, 0.2), 0 2px 8px rgba(255, 255, 255, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
        'inner-glow': 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        'glass': '0.02em',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

