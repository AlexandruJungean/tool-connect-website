import { NextRequest, NextResponse } from 'next/server'

const PLACES_AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete'

// Server-side only - key is not exposed to client
const API_KEY = process.env.GOOGLE_PLACES_API_KEY

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'Places service not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { input } = body

    if (!input || input.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const response = await fetch(PLACES_AUTOCOMPLETE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
      },
      body: JSON.stringify({ input }),
    })

    const data = await response.json()

    if (data.error) {
      console.error('Places API error:', data.error)
      return NextResponse.json({ suggestions: [] })
    }

    // Normalize the response
    const suggestions = (data.suggestions || [])
      .filter((s: { placePrediction?: unknown }) => s.placePrediction)
      .map((s: { placePrediction: { placeId: string; text: { text: string }; structuredFormat: { mainText: { text: string }; secondaryText?: { text: string } } } }) => ({
        place_id: s.placePrediction.placeId,
        description: s.placePrediction.text.text,
        structured_formatting: {
          main_text: s.placePrediction.structuredFormat.mainText.text,
          secondary_text: s.placePrediction.structuredFormat.secondaryText?.text || '',
        },
      }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Places API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Places search failed' },
      { status: 500 }
    )
  }
}
