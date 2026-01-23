import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdecd8',
          200: '#fad5b0',
          300: '#f6b77d',
          400: '#f19148',
          500: '#ed7424',
          600: '#de5a1a',
          700: '#b84317',
          800: '#93361b',
          900: '#772f19',
          950: '#40150b',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
