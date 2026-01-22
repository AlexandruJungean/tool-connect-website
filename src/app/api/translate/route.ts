import { NextRequest, NextResponse } from 'next/server'

const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2'
const DETECT_API_URL = 'https://translation.googleapis.com/language/translate/v2/detect'

// Server-side only - key is not exposed to client
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'Translation service not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { action, text, texts, targetLang, sourceLang } = body

    if (action === 'detect') {
      // Language detection
      if (!text || text.trim().length < 3) {
        return NextResponse.json({ language: null })
      }

      const response = await fetch(`${DETECT_API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text }),
      })

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json({
        language: data.data.detections?.[0]?.[0]?.language || null,
      })
    }

    if (action === 'translate') {
      // Single translation
      if (!text || !targetLang) {
        return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 })
      }

      const response = await fetch(`${TRANSLATE_API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          format: 'text',
          ...(sourceLang && { source: sourceLang }),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.error?.message || `Translation failed: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json({
        translatedText: data.data.translations?.[0]?.translatedText || text,
        detectedSourceLanguage: data.data.translations?.[0]?.detectedSourceLanguage,
      })
    }

    if (action === 'batch') {
      // Batch translation
      if (!texts || !Array.isArray(texts) || !targetLang) {
        return NextResponse.json({ error: 'Missing texts array or targetLang' }, { status: 400 })
      }

      const params = new URLSearchParams({
        key: API_KEY,
        target: targetLang,
        format: 'text',
      })
      texts.forEach((t: string) => params.append('q', t))

      const response = await fetch(`${TRANSLATE_API_URL}?${params.toString()}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`Batch translation failed: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json({
        translations: data.data.translations?.map((t: { translatedText: string }) => t.translatedText) || texts,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Translation failed' },
      { status: 500 }
    )
  }
}
