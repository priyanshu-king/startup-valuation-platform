/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Enable opacity-based border colors (e.g. border-white/8)

  theme: {
    extend: {
      // ── Custom Spacing ─────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',   // 18px — used for icon sizes (w-4.5, h-4.5)
      },
      // ── Brand Color Palette ────────────────────────────────
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#bfd0fe',
          300: '#93adfc',
          400: '#6081f8',
          500: '#3d5af1',   // Primary brand blue
          600: '#2d3de0',
          700: '#242fbb',
          800: '#232a97',
          900: '#222877',
          950: '#161948',
        },
        accent: {
          400: '#a78bfa',   // Violet accent
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        surface: {
          900: '#0f1117',   // Deep background
          800: '#161b27',   // Card background
          700: '#1e2535',   // Elevated card
          600: '#252d3d',   // Hover state
        },
      },

      // ── Typography ────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },

      // ── Custom Shadows ────────────────────────────────────
      boxShadow: {
        'card':      '0 4px 24px 0 rgba(0, 0, 0, 0.35)',
        'card-lg':   '0 8px 48px 0 rgba(0, 0, 0, 0.45)',
        'glow':      '0 0 24px rgba(61, 90, 241, 0.35)',
        'glow-sm':   '0 0 12px rgba(61, 90, 241, 0.25)',
        'glow-accent': '0 0 24px rgba(139, 92, 246, 0.35)',
      },

      // ── Gradients ─────────────────────────────────────────
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #3d5af1 0%, #8b5cf6 100%)',
        'gradient-dark':    'linear-gradient(180deg, #0f1117 0%, #161b27 100%)',
        'gradient-card':    'linear-gradient(135deg, rgba(30, 37, 53, 0.8) 0%, rgba(22, 27, 39, 0.8) 100%)',
        'gradient-glow':    'radial-gradient(ellipse at top, rgba(61, 90, 241, 0.15) 0%, transparent 60%)',
      },

      // ── Animation ─────────────────────────────────────────
      animation: {
        'fade-in':      'fadeIn 0.4s ease-out',
        'slide-up':     'slideUp 0.4s ease-out',
        'slide-down':   'slideDown 0.3s ease-out',
        'scale-in':     'scaleIn 0.3s ease-out',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(61, 90, 241, 0.25)' },
          '50%':      { boxShadow: '0 0 28px rgba(61, 90, 241, 0.50)' },
        },
      },

      // ── Border Radius ─────────────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
