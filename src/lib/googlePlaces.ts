/**
 * Google Places API Service
 * Provides location autocomplete suggestions via server-side API route
 * This keeps the API key secure on the server
 */

const PLACES_API_ROUTE = '/api/places'

// Response types
export interface PlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

/**
 * Search for place predictions using Google Places API via server route
 * @param input - The search query
 * @returns Array of place predictions
 */
export async function searchPlaces(input: string): Promise<PlacePrediction[]> {
  if (!input || input.length < 2) {
    return []
  }

  try {
    const response = await fetch(PLACES_API_ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    })

    if (!response.ok) {
      console.error('Places API error:', response.status)
      return []
    }

    const data = await response.json()
    return data.suggestions || []
  } catch (error) {
    console.error('Places API request failed:', error)
    return []
  }
}

/**
 * Format a place prediction for display
 * @param prediction - The place prediction from Google Places API
 * @returns Formatted location string
 */
export function formatPlacePrediction(prediction: PlacePrediction): string {
  return prediction.description
}

