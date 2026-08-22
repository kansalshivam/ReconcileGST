import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1920px',
      },
    },
    extend: {
      colors: {
        // Base viewport and onyx/zinc surfaces
        terminal: {
          void: 'var(--color-bg-base)',
          surface1: 'var(--color-bg-surface-1)',
          surface2: 'var(--color-bg-surface-2)',
          surface3: 'var(--color-bg-surface-3)',
          glass: 'var(--color-bg-glass)',
          overlay: 'var(--color-bg-overlay)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          default: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
          glow: 'var(--color-border-glow)',
        },
        // Statutory Chromatic Semantics
        recon: {
          brand: {
            DEFAULT: 'var(--color-brand-base)',
            surface: 'var(--color-brand-surface)',
            border: 'var(--color-brand-border)',
            glow: 'var(--color-brand-glow)',
            text: 'var(--color-brand-text)',
          },
          emerald: {
            DEFAULT: 'var(--color-emerald-base)',
            surface: 'var(--color-emerald-surface)',
            border: 'var(--color-emerald-border)',
            glow: 'var(--color-emerald-glow)',
            text: 'var(--color-emerald-text)',
          },
          crimson: {
            DEFAULT: 'var(--color-crimson-base)',
            surface: 'var(--color-crimson-surface)',
            border: 'var(--color-crimson-border)',
            glow: 'var(--color-crimson-glow)',
            text: 'var(--color-crimson-text)',
          },
          amber: {
            DEFAULT: 'var(--color-amber-base)',
            surface: 'var(--color-amber-surface)',
            border: 'var(--color-amber-border)',
            glow: 'var(--color-amber-glow)',
            text: 'var(--color-amber-text)',
          },
          violet: {
            DEFAULT: 'var(--color-violet-base)',
            surface: 'var(--color-violet-surface)',
            border: 'var(--color-violet-border)',
            text: 'var(--color-violet-text)',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.85rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.8125rem', { lineHeight: '1.15rem' }],
        'base': ['0.875rem', { lineHeight: '1.25rem' }],
        'lg': ['1.0rem', { lineHeight: '1.4rem' }],
        'xl': ['1.125rem', { lineHeight: '1.5rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.75rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.1rem' }],
      },
      boxShadow: {
        'terminal-card': 'var(--shadow-terminal-card)',
        'drawer': 'var(--shadow-drawer)',
        'glow-emerald': 'var(--shadow-glow-emerald)',
        'glow-crimson': 'var(--shadow-glow-crimson)',
        'glow-brand': 'var(--shadow-glow-brand)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};

export default config;
