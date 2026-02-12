/**
 * Application Colors — Single Source of Truth
 *
 * Only TWO brand colors (shared with the mobile app):
 *   darkPurple:  #4C1D95
 *   lightPurple: #A78BFA
 *
 * Every shade below is mathematically derived from these two.
 * Nothing comes from Tailwind defaults.
 */

export const BASE_COLORS = {
  darkPurple: '#4C1D95',
  lightPurple: '#A78BFA',
} as const

/**
 * Primary palette — every value derived from darkPurple & lightPurple.
 *
 *  50–300  : lightPurple tinted toward white (backgrounds, borders)
 *  400     : lightPurple (exact)
 *  500–600 : linear blend from lightPurple → darkPurple
 *  700     : darkPurple (exact)
 *  800–900 : darkPurple shaded darker (gradients, deepest UI)
 */
export const PRIMARY = {
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
} as const

/**
 * Semantic aliases for common use-cases.
 */
export const SEMANTIC = {
  /** Dark brand color = darkPurple */
  dark: BASE_COLORS.darkPurple,
  /** Light brand color = lightPurple */
  light: BASE_COLORS.lightPurple,
  /** Theme color for PWA / browser chrome */
  themeColor: BASE_COLORS.darkPurple,
  /** Page background */
  background: '#FFFFFF',
  /** Default text */
  foreground: '#1F2937',
} as const
