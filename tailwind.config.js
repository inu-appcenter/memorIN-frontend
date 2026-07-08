/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      screens: {
        desktop: '768px', // 데스크탑이라고 판단할 최소 너비
        tablet: '390px', // 테블릿이라고 판단할 최소 너비
      },
      maxWidth: {
        limit: '1440px', // 데스크탑 콘텐츠 최대 폭
      },
      // Spacing
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '48px',
      },
      fontFamily: {
        sans: ['Pretendard-Regular'],
      },
      colors: {
        //  Primitive
        blue: {
          50: '#F0F2FA',
          100: '#D1D9F1',
          200: '#A4B4E2',
          300: '#718AD2',
          400: '#4364C4',
          500: '#1F47B9',
          600: '#012EAF',
          700: '#02268C',
          800: '#031F6F',
          900: '#041854',
        },
        yellow: {
          50: '#FFFAEB',
          100: '#FFF2C7',
          200: '#FFE48C',
          300: '#FED347',
          400: '#FEC200',
          500: '#DFAA00',
          600: '#BC9000',
          700: '#9A7500',
          800: '#775A00',
          900: '#5A4400',
        },
        neutral: {
          50: '#F7F8FA',
          100: '#EDEEF2',
          200: '#DADCE3',
          300: '#B8BCC7',
          400: '#8A8F9C',
          500: '#5F6470',
          600: '#464B55',
          700: '#333740',
          800: '#22252B',
          900: '#131519',
        },
        white: '#FFFFFF',

        //  Semantic
        brand: {
          DEFAULT: 'var(--brand-primary)',
          hover: 'var(--brand-primary-hover)',
          press: 'var(--brand-primary-press)',
          subtle: 'var(--brand-primary-subtle)',
        },
        accent: {
          DEFAULT: 'var(--brand-accent)',
          subtle: 'var(--brand-accent-subtle)',
          text: 'var(--brand-accent-text)',
        },
        success: 'var(--status-success)',
        warning: 'var(--status-warning)',
        error: 'var(--status-error)',

        // shadcn/reusables 호환 별칭 (컴포넌트 내부용 — 화면 코드에선 사용 금지)
        background: 'var(--bg-page)',
        foreground: 'var(--text-primary)',
        primary: {
          DEFAULT: 'var(--brand-primary)',
          foreground: 'var(--text-on-brand)',
        },
        secondary: {
          DEFAULT: 'var(--bg-subtle)',
          foreground: 'var(--text-primary)',
        },
        muted: {
          DEFAULT: 'var(--bg-subtle)',
          foreground: 'var(--text-muted)',
        },
        destructive: {
          DEFAULT: 'var(--status-error)',
          foreground: 'var(--text-on-brand)',
        },
        border: 'var(--border-default)',
        input: 'var(--border-strong)',
        ring: 'var(--border-focus)',
        card: { DEFAULT: 'var(--bg-page)', foreground: 'var(--text-primary)' },
        popover: {
          DEFAULT: 'var(--bg-page)',
          foreground: 'var(--text-primary)',
        },
      },

      //  text
      textColor: {
        primary: {
          DEFAULT: 'var(--text-primary)',
          foreground: 'var(--text-on-brand)',
        },
        secondary: {
          DEFAULT: 'var(--text-secondary)',
          foreground: 'var(--text-primary)',
        },
        tertiary: 'var(--text-tertiary)',
        muted: {
          DEFAULT: 'var(--text-muted)',
          foreground: 'var(--text-muted)',
        },
        disabled: 'var(--text-disabled)',
        'on-brand': 'var(--text-on-brand)',
        'on-accent': 'var(--text-on-accent)',
        link: 'var(--text-link)',
        success: 'var(--text-success)',
        warning: 'var(--text-warning)',
        error: 'var(--text-error)',
      },

      //  backgroundColor
      backgroundColor: {
        page: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        subtle: 'var(--bg-subtle)',
      },

      // borderColor
      borderColor: {
        DEFAULT: 'var(--border-default)',
        strong: 'var(--border-strong)',
        focus: 'var(--border-focus)',
      },

      // borderRadius
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        full: '999px',
      },
      // boxShadow (실제값 반영필요)
      boxShadow: {
        card: '0px 1px 4px rgba(19, 21, 25, 0.08)',
        dropdown: '0px 4px 12px rgba(19, 21, 25, 0.10)',
        modal: '0px 8px 28px rgba(19, 21, 25, 0.14)',
      },
    },
  },
  plugins: [],
};
