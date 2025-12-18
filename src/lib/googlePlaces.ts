/**
 * Google Places API (New) Service
 * Provides location autocomplete suggestions using the new Places API
 * https://developers.google.com/maps/documentation/places/web-service/op-overview
 */

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
const PLACES_AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete'

// Response types for the new Places API
export interface PlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface AutocompleteSuggestion {
  placePrediction?: {
    placeId: string
    text: {
      text: string
    }
    structuredFormat: {
      mainText: {
        text: string
      }
      secondaryText: {
        text: string
      }
    }
  }
}

interface PlacesAutocompleteNewResponse {
  suggestions?: AutocompleteSuggestion[]
  error?: {
    code: number
    message: string
    status: string
  }
}

/**
 * Make a request to the Places API (New)
 */
async function makeAutocompleteRequest(
  input: string
): Promise<PlacesAutocompleteNewResponse> {
  const requestBody = {
    input,
  }

  const response = await fetch(PLACES_AUTOCOMPLETE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY || '',
    },
    body: JSON.stringify(requestBody),
  })

  const data = await response.json()
  return data
}

/**
 * Normalize API response to common format
 */
function normalizeResponse(data: PlacesAutocompleteNewResponse): PlacePrediction[] {
  if (!data.suggestions || data.suggestions.length === 0) {
    return []
  }

  return data.suggestions
    .filter((suggestion) => suggestion.placePrediction)
    .map((suggestion) => {
      const prediction = suggestion.placePrediction!
      return {
        place_id: prediction.placeId,
        description: prediction.text.text,
        structured_formatting: {
          main_text: prediction.structuredFormat.mainText.text,
          secondary_text: prediction.structuredFormat.secondaryText?.text || '',
        },
      }
    })
}

/**
 * Search for place predictions using Google Places API (New)
 * @param input - The search query
 * @returns Array of place predictions (normalized to common format)
 */
export async function searchPlaces(input: string): Promise<PlacePrediction[]> {
  if (!input || input.length < 2) {
    return []
  }

  if (!API_KEY) {
    console.warn('Google Places API key not configured')
    return []
  }

  try {
    const data = await makeAutocompleteRequest(input)

    if (data.error) {
      console.error('Places API error:', data.error)
      return []
    }

    return normalizeResponse(data)
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

