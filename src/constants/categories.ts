/**
 * Service Categories and Options
 * 
 * NOTE: SERVICE_CATEGORIES has been moved to the database (categories + subcategories tables).
 * Use the useCategories() hook from @/contexts/CategoriesContext instead.
 * 
 * This file still exports:
 * - Type definitions (OptionSet, ServiceCategory)
 * - LANGUAGES constant
 * - ACCOUNT_TYPES constant
 * - getLanguageLabel() helper
 */

export interface OptionSet {
  value: string
  label: string
  labelCS: string
}

export interface ServiceCategory {
  value: string
  label: string
  labelCS: string
  icon: string
  subcategories: OptionSet[]
}

export const LANGUAGES: OptionSet[] = [
  { value: 'english', label: 'English', labelCS: 'Angličtina' },
  { value: 'arabic', label: 'Arabic', labelCS: 'Arabština' },
  { value: 'bulgarian', label: 'Bulgarian', labelCS: 'Bulharština' },
  { value: 'catalan', label: 'Catalan', labelCS: 'Katalánština' },
  { value: 'chinese_simplified', label: 'Chinese (Simplified)', labelCS: 'Čínština (zjednodušená)' },
  { value: 'chinese_traditional', label: 'Chinese (Traditional)', labelCS: 'Čínština (tradiční)' },
  { value: 'croatian', label: 'Croatian', labelCS: 'Chorvatština' },
  { value: 'czech', label: 'Czech', labelCS: 'Čeština' },
  { value: 'danish', label: 'Danish', labelCS: 'Dánština' },
  { value: 'dutch', label: 'Dutch', labelCS: 'Holandština' },
  { value: 'filipino', label: 'Filipino', labelCS: 'Filipínština' },
  { value: 'finnish', label: 'Finnish', labelCS: 'Finština' },
  { value: 'french', label: 'French', labelCS: 'Francouzština' },
  { value: 'georgian', label: 'Georgian', labelCS: 'Gruzínština' },
  { value: 'german', label: 'German', labelCS: 'Němčina' },
  { value: 'greek', label: 'Greek', labelCS: 'Řečtina' },
  { value: 'hebrew', label: 'Hebrew', labelCS: 'Hebrejština' },
  { value: 'hindi', label: 'Hindi', labelCS: 'Hindština' },
  { value: 'hungarian', label: 'Hungarian', labelCS: 'Maďarština' },
  { value: 'icelandic', label: 'Icelandic', labelCS: 'Islandština' },
  { value: 'indonesian', label: 'Indonesian', labelCS: 'Indonéština' },
  { value: 'italian', label: 'Italian', labelCS: 'Italština' },
  { value: 'japanese', label: 'Japanese', labelCS: 'Japonština' },
  { value: 'korean', label: 'Korean', labelCS: 'Korejština' },
  { value: 'malay', label: 'Malay', labelCS: 'Malajština' },
  { value: 'norwegian', label: 'Norwegian', labelCS: 'Norština' },
  { value: 'polish', label: 'Polish', labelCS: 'Polština' },
  { value: 'portuguese', label: 'Portuguese', labelCS: 'Portugalština' },
  { value: 'punjabi', label: 'Punjabi', labelCS: 'Paňdžábština' },
  { value: 'romanian', label: 'Romanian', labelCS: 'Rumunština' },
  { value: 'russian', label: 'Russian', labelCS: 'Ruština' },
  { value: 'serbian', label: 'Serbian', labelCS: 'Srbština' },
  { value: 'slovenian', label: 'Slovenian', labelCS: 'Slovinština' },
  { value: 'spanish', label: 'Spanish', labelCS: 'Španělština' },
  { value: 'swahili', label: 'Swahili', labelCS: 'Svahilština' },
  { value: 'swedish', label: 'Swedish', labelCS: 'Švédština' },
  { value: 'thai', label: 'Thai', labelCS: 'Thajština' },
  { value: 'turkish', label: 'Turkish', labelCS: 'Turečtina' },
  { value: 'ukrainian', label: 'Ukrainian', labelCS: 'Ukrajinština' },
  { value: 'vietnamese', label: 'Vietnamese', labelCS: 'Vietnamština' },
]

export const ACCOUNT_TYPES: OptionSet[] = [
  { value: 'company', label: 'Company', labelCS: 'Společnost' },
  { value: 'self-employed', label: 'Self-Employed', labelCS: 'OSVČ' },
]

export const getLanguageLabel = (value: string, locale: 'en' | 'cs' = 'en'): string => {
  if (!value) return ''
  const normalizedValue = value.toLowerCase().trim()
  const language = LANGUAGES.find((lang) => lang.value.toLowerCase() === normalizedValue)
  return language ? (locale === 'cs' ? language.labelCS : language.label) : value
}
