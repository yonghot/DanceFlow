import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
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
        neon: {
          pink: '#FF2D78',
          cyan: '#00F0FF',
          gold: '#FFD700',
          purple: '#B537F2',
          red: '#FF3355',
        },
        grade: {
          perfect: '#FFD700',
          great: '#FF2D78',
          good: '#00F0FF',
          ok: '#64748B',
          miss: '#FF3355',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'score-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'grade-glow': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'glow-breathe': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 45, 120, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 45, 120, 0.5), 0 0 40px rgba(255, 45, 120, 0.2)' },
        },
        'slide-up-fade': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'rainbow-shift': {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
      },
      animation: {
        'score-pop': 'score-pop 0.8s ease-out',
        'grade-glow': 'grade-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-breathe': 'glow-breathe 2.5s ease-in-out infinite',
        'slide-up-fade': 'slide-up-fade 0.5s ease-out',
        'rainbow-shift': 'rainbow-shift 3s linear infinite',
      },
      boxShadow: {
        'neon-pink': '0 0 10px rgba(255, 45, 120, 0.3), 0 0 30px rgba(255, 45, 120, 0.15)',
        'neon-cyan': '0 0 10px rgba(0, 240, 255, 0.3), 0 0 30px rgba(0, 240, 255, 0.15)',
        'neon-gold': '0 0 10px rgba(255, 215, 0, 0.3), 0 0 30px rgba(255, 215, 0, 0.15)',
        'neon-pink-lg': '0 0 15px rgba(255, 45, 120, 0.4), 0 0 45px rgba(255, 45, 120, 0.2), 0 0 80px rgba(255, 45, 120, 0.1)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
