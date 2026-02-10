'use client'

import React, { useState } from 'react'
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation'
import { useLanguage } from '@/contexts/LanguageContext'
import { Loader2, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TranslatedTextProps {
  text: string | null | undefined
  className?: string
  as?: 'p' | 'span' | 'div'
  showToggle?: boolean
}

// ISO 639-1 language codes - always show uppercase abbreviation
const LANGUAGE_CODES: Record<string, string> = {
  af: 'AF', // Afrikaans
  ar: 'AR', // Arabic
  bg: 'BG', // Bulgarian
  bn: 'BN', // Bengali
  ca: 'CA', // Catalan
  cs: 'CS', // Czech
  da: 'DA', // Danish
  de: 'DE', // German
  el: 'EL', // Greek
  en: 'EN', // English
  es: 'ES', // Spanish
  et: 'ET', // Estonian
  fa: 'FA', // Persian
  fi: 'FI', // Finnish
  fr: 'FR', // French
  gu: 'GU', // Gujarati
  he: 'HE', // Hebrew
  hi: 'HI', // Hindi
  hr: 'HR', // Croatian
  hu: 'HU', // Hungarian
  id: 'ID', // Indonesian
  it: 'IT', // Italian
  ja: 'JA', // Japanese
  ka: 'KA', // Georgian
  kn: 'KN', // Kannada
  ko: 'KO', // Korean
  lt: 'LT', // Lithuanian
  lv: 'LV', // Latvian
  mk: 'MK', // Macedonian
  ml: 'ML', // Malayalam
  mr: 'MR', // Marathi
  ms: 'MS', // Malay
  nl: 'NL', // Dutch
  no: 'NO', // Norwegian
  pa: 'PA', // Punjabi
  pl: 'PL', // Polish
  pt: 'PT', // Portuguese
  ro: 'RO', // Romanian
  ru: 'RU', // Russian
  sk: 'SK', // Slovak
  sl: 'SL', // Slovenian
  sq: 'SQ', // Albanian
  sr: 'SR', // Serbian
  sv: 'SV', // Swedish
  sw: 'SW', // Swahili
  ta: 'TA', // Tamil
  te: 'TE', // Telugu
  th: 'TH', // Thai
  tl: 'TL', // Filipino/Tagalog
  tr: 'TR', // Turkish
  uk: 'UK', // Ukrainian
  ur: 'UR', // Urdu
  vi: 'VI', // Vietnamese
  zh: 'ZH', // Chinese
  'zh-CN': 'ZH', // Chinese Simplified
  'zh-TW': 'ZH', // Chinese Traditional
}

export function TranslatedText({
  text,
  className,
  as: Component = 'p',
  showToggle = true,
}: TranslatedTextProps) {
  const { language } = useLanguage()
  const { text: translatedText, isTranslating, wasTranslated, sourceLang } = useDynamicTranslation(text)
  const [showOriginal, setShowOriginal] = useState(false)

  if (!text) return null

  const displayText = showOriginal ? text : (translatedText || text)
  // Always display the language code in uppercase (e.g., EN, CS, DE)
  const sourceLanguageLabel = sourceLang 
    ? LANGUAGE_CODES[sourceLang] || LANGUAGE_CODES[sourceLang.split('-')[0]] || sourceLang.toUpperCase().slice(0, 2)
    : null

  return (
    <div className="relative">
      {isTranslating ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">{language === 'cs' ? 'Překládám...' : 'Translating...'}</span>
        </div>
      ) : (
        <>
          <Component className={cn(className, 'whitespace-pre-line')}>
            {displayText}
          </Component>
          
          {showToggle && wasTranslated && sourceLanguageLabel && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50/60 px-4 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Languages className="w-4 h-4 text-primary-700 flex-shrink-0" />
                <p className="text-sm text-gray-800 truncate">
                  {language === 'cs'
                    ? `Automaticky přeloženo z ${sourceLanguageLabel}`
                    : `Auto-translated from ${sourceLanguageLabel}`}
                </p>
              </div>

              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={cn(
                  'flex-shrink-0 inline-flex items-center justify-center',
                  'px-3.5 py-2 rounded-lg text-sm font-semibold',
                  'bg-primary-700 text-white shadow-sm',
                  'hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  'transition-colors'
                )}
              >
                {showOriginal
                  ? (language === 'cs' ? 'Zobrazit překlad' : 'Show translation')
                  : (language === 'cs' ? 'Zobrazit originál' : 'Show original')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

