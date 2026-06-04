/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — Structure & Typography
        primary: {
          DEFAULT: '#34303A',
          container: '#25222B',
          'on': '#FFFFFF',
          'on-container': '#FAF7F5',
          fixed: '#F4F0ED',
          'fixed-dim': '#E4DAD4',
        },
        // Secondary — Actions
        secondary: {
          DEFAULT: '#B8322A',
          container: '#CF3A32',
          'on': '#FFFFFF',
          'on-container': '#FEFCFF',
          fixed: '#FCEBE8',
          'fixed-dim': '#F6C9C3',
        },
        info: {
          DEFAULT: '#8A5A52',
          container: '#9A675D',
          dark: '#5A342F',
          fixed: '#F6EFEC',
          'fixed-dim': '#E8DAD5',
        },
        // Tertiary/Emerald — Positive States (Timer, Success)
        emerald: {
          DEFAULT: '#176F51',
          dim: '#2F9A73',
          glow: '#8FD8BC',
          container: '#EAF6F0',
          dark: '#0F513A',
        },
        // Surface layers
        surface: {
          DEFAULT: '#FCFAF8',
          bright: '#FFFFFF',
          dim: '#E9E1DC',
          white: '#FFFFFF',
          low: '#F7F2EF',
          container: '#EFE7E2',
          'container-high': '#E9E1DC',
          'container-highest': '#D8CCC5',
        },
        // Text
        ink: {
          DEFAULT: '#25222B',
          muted: '#514A55',
          subtle: '#6F6672',
        },
        // Borders
        border: {
          DEFAULT: '#E0D6D0',
          subtle: '#ECE3DE',
        },
        // Semantic
        error: {
          DEFAULT: '#9F1239',
          container: '#FFE4E6',
          'on-container': '#881337',
        },
        amber: {
          DEFAULT: '#8A5200',
          light: '#FFF2D5',
          900: '#6B3B00',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'timer': ['56px', { lineHeight: '1', fontWeight: '800', letterSpacing: '0' }],
        'display': ['44px', { lineHeight: '1.12', fontWeight: '800', letterSpacing: '0' }],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '12px',
        md: '16px',
        lg: '20px',
        xl: '28px',
        '2xl': '32px',
      },
      maxWidth: {
        content: '1200px',
        reading: '800px',
        form: '720px',
      },
      boxShadow: {
        card: '0 12px 36px rgba(37, 34, 43, 0.06)',
        'card-hover': '0 18px 46px rgba(37, 34, 43, 0.11)',
        modal: '0 24px 64px rgba(37, 34, 43, 0.18)',
      },
      spacing: {
        xs: '4px',
        sm: '12px',
        md: '24px',
        lg: '40px',
        xl: '64px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        modal: '12px',
      },
    },
  },
  plugins: [],
}
