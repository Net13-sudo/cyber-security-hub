module.exports = {
  content: [
    "./pages/*.{html,js}",
    "./index.html",
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./components/**/*.{html,js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Dark Red/Crimson (security/danger theme)
        primary: {
          DEFAULT: "#dc2626", // crimson-red
          50: "#fef2f2", // crimson-50
          100: "#fee2e2", // crimson-100
          200: "#fecaca", // crimson-200
          300: "#fca5a5", // crimson-300
          400: "#f87171", // crimson-400
          500: "#ef4444", // crimson-500
          600: "#dc2626", // crimson-600
          700: "#b91c1c", // crimson-700
          800: "#991b1b", // crimson-800
          900: "#7f1d1d", // crimson-900
        },
        // Secondary Colors - Darker Grays/Black (background darkness)
        secondary: {
          DEFAULT: "#000000", // pure-black
          50: "#f9fafb", // gray-50
          100: "#f3f4f6", // gray-100
          200: "#e5e7eb", // gray-200
          300: "#d1d5db", // gray-300
          400: "#9ca3af", // gray-400
          500: "#6b7280", // gray-500
          600: "#374151", // gray-600
          700: "#1f2937", // gray-700
          800: "#0a0a0a", // near-black
          900: "#050505", // pure-black
        },
        // Accent Colors - Dark Orange/Gold (warning/highlight theme)
        accent: {
          DEFAULT: "#f59e0b", // amber-500
          50: "#fffbeb", // orange-50
          100: "#fef3c7", // orange-100
          200: "#fde68a", // orange-200
          300: "#fcd34d", // orange-300
          400: "#fbbf24", // orange-400
          500: "#f59e0b", // orange-500
          600: "#d97706", // orange-600
          700: "#b45309", // orange-700
          800: "#92400e", // orange-800
          900: "#78350f", // orange-900
        },
        // Background Colors
        background: "#050505", // deeper black
        surface: "#0a0a0a", // dark surface
        // Text Colors
        text: {
          primary: "#f8fafc", // slate-50
          secondary: "#94a3b8", // slate-400
        },
        // Status Colors
        success: {
          DEFAULT: "#10B981", // emerald-500
          50: "#ECFDF5", // emerald-50
          100: "#D1FAE5", // emerald-100
          500: "#10B981", // emerald-500
          600: "#059669", // emerald-600
          700: "#047857", // emerald-700
        },
        warning: {
          DEFAULT: "#F59E0B", // amber-500
          50: "#FFFBEB", // amber-50
          100: "#FEF3C7", // amber-100
          500: "#F59E0B", // amber-500
          600: "#D97706", // amber-600
          700: "#B45309", // amber-700
        },
        error: {
          DEFAULT: "#EF4444", // red-500
          50: "#FEF2F2", // red-50
          100: "#FEE2E2", // red-100
          500: "#EF4444", // red-500
          600: "#DC2626", // red-600
          700: "#B91C1C", // red-700
        },
        // Border Colors
        border: {
          DEFAULT: "#1e293b", // slate-800
          light: "#334155", // slate-700
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        inter: ['Inter', 'sans-serif'],
        jetbrains: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.2' }],
      },
      boxShadow: {
        'protective': '0 1px 3px rgba(220, 38, 38, 0.1)',
        'elevated': '0 4px 12px rgba(220, 38, 38, 0.15)',
        'critical': '0 10px 25px rgba(220, 38, 38, 0.2)',
        'glow': '0 0 20px rgba(234, 88, 12, 0.4)',
        'glow-strong': '0 0 30px rgba(234, 88, 12, 0.6)',
        'cyber-glow': '0 0 40px rgba(220, 38, 38, 0.5), 0 0 80px rgba(234, 88, 12, 0.3)',
      },
      animation: {
        'scan': 'scan 1200ms ease-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'cyber-pulse': 'cyber-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': {
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '50%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(234, 88, 12, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(234, 88, 12, 0.8)',
          },
        },
        'cyber-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 10px rgba(220, 38, 38, 0.3), 0 0 20px rgba(234, 88, 12, 0.2)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.6), 0 0 40px rgba(234, 88, 12, 0.4)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '800': '800ms',
        '1200': '1200ms',
      },
      transitionTimingFunction: {
        'out': 'ease-out',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}