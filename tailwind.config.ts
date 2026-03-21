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
        // Rafaela Finance — paleta vinho
        wine: {
          50:  '#FBF3F7',
          100: '#F5E6EF',
          200: '#E8C5D6',
          300: '#D4A0BA',
          400: '#B5747D',
          500: '#9A5070',
          600: '#7A3D5C',
          700: '#5B2D45',
          800: '#3D1A2C',
          900: '#26101C',
        },
        blush: {
          50:  '#FDF8F6',
          100: '#F7EDE8',
          200: '#EFE3DC',
          300: '#E6D5CB',
          400: '#D8B8B0',
          500: '#C49A90',
          600: '#AD7D73',
        },
        mauve: {
          400: '#C4919A',
          500: '#B5747D',
          600: '#9A5D66',
        },
        // Semânticos
        sage: {
          50:  '#F1F6F2',
          100: '#E0EDE2',
          200: '#AFCBB3',
          500: '#5A7A5C',
          600: '#4A6B4C',
          700: '#3D5E3F',
        },
        amber: {
          50:  '#FEF5E9',
          100: '#FDE9CC',
          500: '#D98A3C',
          600: '#C4752A',
          700: '#8A500A',
        },
        overdue: {
          50:  '#FAF0F3',
          200: '#F0C5D0',
          500: '#C0405E',
          700: '#9B1D3E',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Jost', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'Monaco', '"Cascadia Code"', '"Roboto Mono"', 'Menlo', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      minHeight: {
        '12': '3rem',
      },
    },
  },
  plugins: [],
}

export default config
