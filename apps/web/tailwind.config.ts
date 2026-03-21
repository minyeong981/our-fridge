import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/shared/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50:  '#F0FAFF',
          100: '#DBF3FF',
          200: '#B8E1FF',
          300: '#8AD6FF',
          400: '#66C5FF',
          500: '#4ABCFF',
          600: '#14A8FF',
          700: '#0088D6',
          800: '#006199',
          900: '#004166',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50:  '#FFF6F0',
          100: '#FFEADB',
          200: '#FFD7B8',
          300: '#FFC08F',
          400: '#FFAE70',
          500: '#FF9E55',
          600: '#FF7A14',
          700: '#D65D00',
          800: '#994200',
          900: '#662C00',
        },
        tertiary: {
          DEFAULT: 'hsl(var(--tertiary))',
          foreground: 'hsl(var(--tertiary-foreground))',
          50:  '#FFFBF0',
          100: '#FFF6DB',
          200: '#FFEDB8',
          300: '#FFE38F',
          400: '#FFDB70',
          500: '#FFD966',
          600: '#FFC414',
          700: '#D6A100',
          800: '#997300',
          900: '#664D00',
        },
        neutral: {
          DEFAULT: 'hsl(var(--neutral))',
          foreground: 'hsl(var(--neutral-foreground))',
          50:  '#F3F7FC',
          100: '#E5EAF0',
          200: '#CFD9E3',
          300: '#AFBFD0',
          400: '#88A0B9',
          500: '#5B7A9B',
          600: '#48607A',
          700: '#35475A',
          800: '#263340',
          900: '#18212A',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
