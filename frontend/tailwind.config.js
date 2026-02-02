/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    // ==========================================
    // SPACING SYSTEM (8pt Grid)
    // ==========================================
    spacing: {
      '0': '0px',
      '0.5': '2px',
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '8': '32px',
      '10': '40px',
      '12': '48px',
      '16': '64px',
      '20': '80px',
      '24': '96px',
      '32': '128px',
      '40': '160px',
      '48': '192px',
      '56': '224px',
      '64': '256px',
    },

    extend: {
      // ==========================================
      // COLOR TOKENS
      // ==========================================
      colors: {
        // Primary Brand Colors - Professional Blue
        primary: {
          50: '#f0f7ff',
          100: '#e0f0fe',
          200: '#b9e0fe',
          300: '#7cc8fd',
          400: '#36adf9',
          500: '#0c93eb',
          600: '#0074c9',
          700: '#015da3',
          800: '#064e86',
          900: '#0b426f',
          950: '#072a4a',
          DEFAULT: '#0074c9',
        },
        // Secondary Colors - Neutral Slate
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
          DEFAULT: '#64748b',
        },
        // Semantic Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          DEFAULT: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
          DEFAULT: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
          DEFAULT: '#dc2626',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
          DEFAULT: '#0284c7',
        },
        // Surface Colors (CSS Variables for theming)
        surface: 'var(--surface-color)',
        background: 'var(--background-color)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border-color': 'var(--border-color)',
        'border-subtle': 'var(--border-subtle)',
        accent: {
          DEFAULT: 'var(--accent-color)',
          hover: 'var(--accent-hover)',
        },
      },

      // ==========================================
      // TYPOGRAPHY SYSTEM
      // ==========================================
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.03em' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'lg': ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        'xl': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        '5xl': ['48px', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display': ['56px', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },

      // ==========================================
      // BORDER RADIUS SYSTEM
      // ==========================================
      borderRadius: {
        'none': '0',
        'xs': '4px',
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        'full': '9999px',
      },

      // ==========================================
      // SHADOW SYSTEM
      // ==========================================
      boxShadow: {
        'none': 'none',
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        // Component-specific shadows
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'dropdown': '0 10px 40px -8px rgb(0 0 0 / 0.15), 0 4px 16px -4px rgb(0 0 0 / 0.1)',
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'button': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'button-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'input-focus': '0 0 0 3px var(--ring-color)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        // Primary color shadows for emphasis
        'primary': '0 4px 14px 0 rgb(0 116 201 / 0.4)',
        'success': '0 4px 14px 0 rgb(22 163 74 / 0.4)',
        'danger': '0 4px 14px 0 rgb(220 38 38 / 0.4)',
      },

      // ==========================================
      // ANIMATION SYSTEM
      // ==========================================
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // ==========================================
      // TRANSITION SYSTEM
      // ==========================================
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // ==========================================
      // Z-INDEX SYSTEM
      // ==========================================
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'dropdown': '100',
        'sticky': '200',
        'header': '300',
        'sidebar': '400',
        'modal-backdrop': '500',
        'modal': '510',
        'popover': '600',
        'tooltip': '700',
        'toast': '800',
        'max': '9999',
      },

      // ==========================================
      // LAYOUT SYSTEM
      // ==========================================
      maxWidth: {
        'container': '1440px',
        'content': '1280px',
        'form': '640px',
        'modal-sm': '400px',
        'modal-md': '560px',
        'modal-lg': '720px',
        'modal-xl': '900px',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - 80px)',
      },

      // ==========================================
      // ASPECT RATIOS
      // ==========================================
      aspectRatio: {
        'card': '4 / 3',
        'video': '16 / 9',
        'square': '1 / 1',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // Custom plugin for component utilities
    function ({ addUtilities, addComponents, theme }) {
      // Focus ring utility
      addUtilities({
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 3px var(--ring-color, ${theme('colors.primary.200')})`,
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: `0 0 0 3px var(--ring-color, ${theme('colors.primary.200')})`,
          },
        },
        '.focus-ring-offset': {
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 2px white, 0 0 0 4px var(--ring-color, ${theme('colors.primary.500')})`,
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: `0 0 0 2px white, 0 0 0 4px var(--ring-color, ${theme('colors.primary.500')})`,
          },
        },
        // Scrollbar utilities
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
        },
        '.scrollbar-hidden': {
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        // Glass morphism
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
        },
        '.glass-dark': {
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
        },
        // Skeleton loading
        '.skeleton': {
          backgroundColor: theme('colors.secondary.200'),
          backgroundImage: `linear-gradient(90deg, ${theme('colors.secondary.200')}, ${theme('colors.secondary.100')}, ${theme('colors.secondary.200')})`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        },
      });

      // Component classes
      addComponents({
        // Container component
        '.container-app': {
          width: '100%',
          maxWidth: theme('maxWidth.container'),
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@screen md': {
            paddingLeft: theme('spacing.6'),
            paddingRight: theme('spacing.6'),
          },
          '@screen lg': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          },
        },
        // Truncate text with ellipsis
        '.truncate-2': {
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
        '.truncate-3': {
          display: '-webkit-box',
          '-webkit-line-clamp': '3',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
      });
    },
  ],
}
