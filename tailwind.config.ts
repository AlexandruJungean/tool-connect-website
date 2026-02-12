import type { Config } from 'tailwindcss'

/**
 * Primary palette — derived from only 2 brand colors:
 *   darkPurple:  #4C1D95
 *   lightPurple: #A78BFA
 *
 * Source of truth: src/constants/colors.ts
 * Keep this in sync with that file.
 */
const primary = {
  50:  '#F8F6FF',  // 8% lightPurple + 92% white
  100: '#F2EEFE',  // 15% lightPurple + 85% white
  200: '#E0D6FD',  // 35% lightPurple + 65% white
  300: '#C6B4FC',  // 65% lightPurple + 35% white
  400: '#A78BFA',  // lightPurple
  500: '#8967D9',  // 33% toward darkPurple
  600: '#6A41B6',  // 67% toward darkPurple
  700: '#4C1D95',  // darkPurple
  800: '#441A86',  // darkPurple at 90% brightness
  900: '#3D1777',  // darkPurple at 80% brightness
}

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
