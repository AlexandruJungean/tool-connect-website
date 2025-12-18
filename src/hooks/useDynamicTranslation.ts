'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { smartTranslate, translateBatch, LanguageCode } from '@/lib/googleTranslate'

interface TranslationState {
  text: string
  isTranslating: boolean
  wasTranslated: boolean
  sourceLang?: string
}

/**
 * Hook for dynamically translating user-generated content
 */
export function useDynamicTranslation(originalText: string | null | undefined) {
  const { language } = useLanguage()
  const [state, setState] = useState<TranslationState>({
    text: originalText || '',
    isTranslating: false,
    wasTranslated: false,
  })

  useEffect(() => {
    if (!originalText) {
      setState({ text: '', isTranslating: false, wasTranslated: false })
      return
    }

    const translate = async () => {
      setState(prev => ({ ...prev, isTranslating: true }))

      try {
        const result = await smartTranslate(originalText, language as LanguageCode)
        setState({
          text: result.text,
          isTranslating: false,
          wasTranslated: result.wasTranslated,
          sourceLang: result.sourceLang,
        })
      } catch (error) {
        console.error('Translation failed:', error)
        setState({
          text: originalText,
          isTranslating: false,
          wasTranslated: false,
        })
      }
    }

    translate()
  }, [originalText, language])

  return state
}

/**
 * Hook for batch translating multiple texts
 */
export function useBatchTranslation(originalTexts: (string | null | undefined)[]) {
  const { language } = useLanguage()
  const [translations, setTranslations] = useState<string[]>([])
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    const validTexts = originalTexts.filter((t): t is string => !!t)
    
    if (validTexts.length === 0) {
      setTranslations(originalTexts.map(t => t || ''))
      return
    }

    const translate = async () => {
      setIsTranslating(true)

      try {
        const results = await translateBatch(validTexts, language as LanguageCode)
        
        // Map back to original indices
        let resultIndex = 0
        const mapped = originalTexts.map(t => {
          if (!t) return ''
          return results[resultIndex++] || t
        })
        
        setTranslations(mapped)
      } catch (error) {
        console.error('Batch translation failed:', error)
        setTranslations(originalTexts.map(t => t || ''))
      } finally {
        setIsTranslating(false)
      }
    }

    translate()
  }, [originalTexts.join('|'), language])

  return { translations, isTranslating }
}

/**
 * Hook for on-demand translation with manual trigger
 */
export function useManualTranslation() {
  const { language } = useLanguage()
  const [state, setState] = useState<TranslationState>({
    text: '',
    isTranslating: false,
    wasTranslated: false,
  })

  const translate = useCallback(async (text: string) => {
    if (!text) {
      setState({ text: '', isTranslating: false, wasTranslated: false })
      return
    }

    setState(prev => ({ ...prev, isTranslating: true }))

    try {
      const result = await smartTranslate(text, language as LanguageCode)
      setState({
        text: result.text,
        isTranslating: false,
        wasTranslated: result.wasTranslated,
        sourceLang: result.sourceLang,
      })
    } catch (error) {
      console.error('Translation failed:', error)
      setState({
        text,
        isTranslating: false,
        wasTranslated: false,
      })
    }
  }, [language])

  const reset = useCallback(() => {
    setState({ text: '', isTranslating: false, wasTranslated: false })
  }, [])

  return { ...state, translate, reset }
}

