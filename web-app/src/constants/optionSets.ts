/**
 * Option Sets - Complete set of options matching mobile app
 */

export interface OptionSet {
  value: string
  label: string
  labelCS: string
}

export interface CurrencyOption extends OptionSet {
  symbol: string
}

// Time Periods
export const TIME_PERIODS: OptionSet[] = [
  { value: 'hour', label: 'Hour', labelCS: 'Hodina' },
  { value: 'day', label: 'Day', labelCS: 'Den' },
  { value: 'week', label: 'Week', labelCS: 'Týden' },
  { value: 'month', label: 'Month', labelCS: 'Měsíc' },
]

// Report Reasons
export const REPORT_REASONS: OptionSet[] = [
  { value: 'harassment', label: 'Harassment', labelCS: 'Obtěžování' },
  { value: 'misinformation', label: 'Misinformation', labelCS: 'Dezinformace' },
  { value: 'inappropriate_content', label: 'Inappropriate/Explicit Content', labelCS: 'Nevhodný/Explicitní obsah' },
  { value: 'illegal_activities', label: 'Illegal Activities', labelCS: 'Nelegální činnosti' },
  { value: 'false_content', label: 'False Content', labelCS: 'Nepravdivý obsah' },
  { value: 'scams_fraud', label: 'Scams or Fraud', labelCS: 'Podvody nebo klamání' },
  { value: 'other', label: 'Other', labelCS: 'Jiné' },
]

// Currencies
export const CURRENCIES: CurrencyOption[] = [
  { value: 'EUR', label: 'EUR', labelCS: 'EUR', symbol: '€' },
  { value: 'USD', label: 'USD', labelCS: 'USD', symbol: '$' },
  { value: 'GBP', label: 'GBP', labelCS: 'GBP', symbol: '£' },
  { value: 'CZK', label: 'CZK', labelCS: 'CZK', symbol: 'Kč' },
]

// Account Types
export const ACCOUNT_TYPES: OptionSet[] = [
  { value: 'company', label: 'Company', labelCS: 'Společnost' },
  { value: 'self-employed', label: 'Self-Employed', labelCS: 'OSVČ' },
]

// Application Statuses
export const APPLICATION_STATUSES: OptionSet[] = [
  { value: 'pending', label: 'Pending', labelCS: 'Čeká na schválení' },
  { value: 'accepted', label: 'Accepted', labelCS: 'Přijato' },
  { value: 'rejected', label: 'Rejected', labelCS: 'Odmítnuto' },
  { value: 'completed', label: 'Completed', labelCS: 'Dokončeno' },
  { value: 'cancelled', label: 'Cancelled', labelCS: 'Zrušeno' },
]

// Request Statuses
export const REQUEST_STATUSES: OptionSet[] = [
  { value: 'open', label: 'Open', labelCS: 'Otevřeno' },
  { value: 'in_progress', label: 'In Progress', labelCS: 'Probíhá' },
  { value: 'completed', label: 'Completed', labelCS: 'Dokončeno' },
  { value: 'cancelled', label: 'Cancelled', labelCS: 'Zrušeno' },
]

// Helper functions
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = CURRENCIES.find((cur) => cur.value === currencyCode)
  return currency?.symbol || currencyCode
}

export const getOptionLabel = (
  options: OptionSet[],
  value: string,
  locale: 'en' | 'cs' = 'en'
): string => {
  const option = options.find((opt) => opt.value === value)
  return option ? (locale === 'cs' ? option.labelCS : option.label) : value
}

export const getTimePeriodLabel = (value: string, locale: 'en' | 'cs' = 'en'): string => {
  return getOptionLabel(TIME_PERIODS, value, locale)
}

export const getReportReasonLabel = (value: string, locale: 'en' | 'cs' = 'en'): string => {
  return getOptionLabel(REPORT_REASONS, value, locale)
}

