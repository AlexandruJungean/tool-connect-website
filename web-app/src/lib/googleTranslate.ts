/**
 * Google Cloud Translation API Service
 * Translates dynamic user-generated content
 * https://cloud.google.com/translate/docs/reference/rest/v2/translate
 */

const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2'
const DETECT_API_URL = 'https://translation.googleapis.com/language/translate/v2/detect'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY

export type LanguageCode = 'en' | 'cs'

// Cache configuration
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// In-memory cache for translations
const memoryCache: Map<string, { text: string; timestamp: number; sourceLang?: string }> = new Map()

interface TranslateResponse {
  data: {
    translations: Array<{
      translatedText: string
      detectedSourceLanguage?: string
    }>
  }
}

interface DetectResponse {
  data: {
    detections: Array<Array<{
      language: string
      confidence: number
      isReliable: boolean
    }>>
  }
}

/**
 * Generate a cache key for a translation
 */
function getCacheKey(text: string, targetLang: LanguageCode): string {
  const hash = text.split('').reduce((acc, char) => {
    const chr = char.charCodeAt(0)
    return ((acc << 5) - acc) + chr
  }, 0)
  return `${targetLang}_${hash}`
}

/**
 * Get cached translation
 */
function getCachedTranslation(
  text: string,
  targetLang: LanguageCode
): { text: string; sourceLang?: string } | null {
  const cacheKey = getCacheKey(text, targetLang)

  const memCached = memoryCache.get(cacheKey)
  if (memCached && Date.now() - memCached.timestamp < CACHE_EXPIRY_MS) {
    return { text: memCached.text, sourceLang: memCached.sourceLang }
  }

  // Also check localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`translation_${cacheKey}`)
      if (cached) {
        const { text: cachedText, timestamp, sourceLang } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
          memoryCache.set(cacheKey, { text: cachedText, timestamp, sourceLang })
          return { text: cachedText, sourceLang }
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return null
}

/**
 * Cache a translation
 */
function cacheTranslation(
  originalText: string,
  translatedText: string,
  targetLang: LanguageCode,
  sourceLang?: string
): void {
  const cacheKey = getCacheKey(originalText, targetLang)
  const cacheData = { text: translatedText, timestamp: Date.now(), sourceLang }

  memoryCache.set(cacheKey, cacheData)

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`translation_${cacheKey}`, JSON.stringify(cacheData))
    } catch {
      // Ignore localStorage errors
    }
  }
}

/**
 * Detect the language of a text
 */
export async function detectLanguage(text: string): Promise<string | null> {
  if (!API_KEY) {
    return null
  }

  if (!text || text.trim().length < 3) {
    return null
  }

  try {
    const response = await fetch(`${DETECT_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: text }),
    })

    if (!response.ok) {
      throw new Error(`Detection failed: ${response.status}`)
    }

    const data: DetectResponse = await response.json()
    return data.data.detections?.[0]?.[0]?.language || null
  } catch (error) {
    console.error('Language detection failed:', error)
    return null
  }
}

/**
 * Translate a single text string
 */
export async function translateText(
  text: string,
  targetLang: LanguageCode,
  sourceLang?: string
): Promise<string> {
  if (!API_KEY) {
    console.warn('Google Translate API key not configured')
    return text
  }

  if (!text || text.trim().length === 0) {
    return text
  }

  // Check cache first
  const cached = getCachedTranslation(text, targetLang)
  if (cached) {
    return cached.text
  }

  try {
    // Use POST with body for better security (API key not in URL)
    const response = await fetch(`${TRANSLATE_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        format: 'text',
        ...(sourceLang && { source: sourceLang }),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Translation API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData?.error?.message || 'Unknown error',
      })
      throw new Error(`Translation failed: ${errorData?.error?.message || response.status}`)
    }

    const data: TranslateResponse = await response.json()
    const translatedText = data.data.translations?.[0]?.translatedText || text

    // Decode HTML entities
    const decodedText = decodeHtmlEntities(translatedText)

    // Get detected source language
    const detectedSourceLang = sourceLang || data.data.translations?.[0]?.detectedSourceLanguage

    // Cache the result
    cacheTranslation(text, decodedText, targetLang, detectedSourceLang)

    return decodedText
  } catch (error) {
    console.error('Translation failed:', error)
    return text
  }
}

/**
 * Translate multiple texts in a batch
 */
export async function translateBatch(
  texts: string[],
  targetLang: LanguageCode
): Promise<string[]> {
  if (!API_KEY) {
    return texts
  }

  if (texts.length === 0) {
    return texts
  }

  const results: (string | null)[] = new Array(texts.length).fill(null)
  const uncachedIndices: number[] = []
  const uncachedTexts: string[] = []

  // Check cache for each text
  for (let i = 0; i < texts.length; i++) {
    if (!texts[i] || texts[i].trim().length === 0) {
      results[i] = texts[i]
      continue
    }

    const cached = getCachedTranslation(texts[i], targetLang)
    if (cached) {
      results[i] = cached.text
    } else {
      uncachedIndices.push(i)
      uncachedTexts.push(texts[i])
    }
  }

  if (uncachedTexts.length === 0) {
    return results as string[]
  }

  try {
    const params = new URLSearchParams({
      key: API_KEY,
      target: targetLang,
      format: 'text',
    })

    uncachedTexts.forEach(text => params.append('q', text))

    const response = await fetch(`${TRANSLATE_API_URL}?${params.toString()}`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Batch translation failed: ${response.status}`)
    }

    const data: TranslateResponse = await response.json()
    const translations = data.data.translations

    for (let i = 0; i < uncachedIndices.length; i++) {
      const originalIndex = uncachedIndices[i]
      const translatedText = decodeHtmlEntities(translations[i]?.translatedText || uncachedTexts[i])
      results[originalIndex] = translatedText

      cacheTranslation(uncachedTexts[i], translatedText, targetLang)
    }

    return results as string[]
  } catch (error) {
    console.error('Batch translation failed:', error)
    for (const index of uncachedIndices) {
      results[index] = texts[index]
    }
    return results as string[]
  }
}

/**
 * Smart translate - only translates if needed
 */
export async function smartTranslate(
  text: string,
  targetLang: LanguageCode
): Promise<{ text: string; wasTranslated: boolean; sourceLang?: string }> {
  if (!text || text.trim().length < 3) {
    return { text, wasTranslated: false }
  }

  const cached = getCachedTranslation(text, targetLang)
  if (cached) {
    return { text: cached.text, wasTranslated: true, sourceLang: cached.sourceLang }
  }

  const sourceLang = await detectLanguage(text)

  if (sourceLang === targetLang) {
    return { text, wasTranslated: false, sourceLang }
  }

  const translatedText = await translateText(text, targetLang, sourceLang || undefined)

  return {
    text: translatedText,
    wasTranslated: translatedText !== text,
    sourceLang: sourceLang || undefined,
  }
}

/**
 * Decode HTML entities that Google Translate sometimes returns
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  }

  return text.replace(/&[^;]+;/g, (match) => entities[match] || match)
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  memoryCache.clear()

  if (typeof window !== 'undefined') {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('translation_')) {
          localStorage.removeItem(key)
        }
      })
    } catch {
      // Ignore localStorage errors
    }
  }
}

