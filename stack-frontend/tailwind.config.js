/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medium-inspired color palette
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Medium green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Medium-specific colors
        medium: {
          green: '#1a8917',
          'green-light': '#36b432',
          'green-dark': '#0d7c0d',
          text: '#242424',
          'text-light': '#757575',
          'text-lighter': '#8b8b8b',
          border: '#e6e6e6',
          'border-dark': '#d6d6d6',
          bg: '#ffffff',
          'bg-light': '#fafafa',
          'bg-gray': '#f7f7f7',
        },
        // Dark mode colors inspired by Medium's dark theme
        dark: {
          bg: '#0f0f0f',
          'bg-light': '#1a1a1a',
          'bg-gray': '#242424',
          text: '#e6e6e6',
          'text-light': '#b3b3b3',
          'text-lighter': '#8b8b8b',
          border: '#404040',
          'border-light': '#333333',
        }
      },
             fontFamily: {
         // Medium-inspired typography
         'serif': ['Source Serif Pro', 'Georgia', 'serif'],
         'sans': ['Inter', 'SF Pro Text', 'SF Pro Display', 'system-ui', 'sans-serif'],
         'mono': ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
       },
      fontSize: {
        // Medium-inspired font sizes
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        // Medium article typography
        'article-sm': ['0.875rem', { lineHeight: '1.58' }],
        'article-base': ['1.0625rem', { lineHeight: '1.58' }],
        'article-lg': ['1.25rem', { lineHeight: '1.58' }],
        'title-sm': ['1.25rem', { lineHeight: '1.22' }],
        'title-base': ['1.5rem', { lineHeight: '1.22' }],
        'title-lg': ['2rem', { lineHeight: '1.22' }],
        'title-xl': ['2.5rem', { lineHeight: '1.04' }],
      },
      spacing: {
        // Medium-inspired spacing
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      maxWidth: {
        // Medium-inspired content widths
        'article': '680px',
        'reading': '728px',
        'content': '1192px',
      },
      animation: {
        // Subtle animations like Medium
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        // Medium-inspired shadows
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'card': '0 2px 4px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'button': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'button-hover': '0 2px 4px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        // Medium-inspired border radius
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
    },
  },
  plugins: [],
} 