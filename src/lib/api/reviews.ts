/**
 * Reviews API Service
 */

import { supabase } from '@/lib/supabase'

// Re-export the Review type from the database types to ensure consistency
import { Review as DBReview } from '@/types/database'
export type Review = DBReview

export const getProviderReviews = async (providerId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      client:client_profiles(id, name, surname, avatar_url)
    `)
    .eq('service_provider_id', providerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  
  return (data || []) as unknown as Review[]
}

export const getMyReviews = async (clientId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Review[]
}

export const getReviewByClientAndProvider = async (
  clientId: string,
  providerId: string
): Promise<Review | null> => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      client:client_profiles(id, name, surname, avatar_url)
    `)
    .eq('client_id', clientId)
    .eq('service_provider_id', providerId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as unknown as Review
}

export const createReview = async (
  clientId: string,
  providerId: string,
  rating: number,
  comment?: string
): Promise<Review> => {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      client_id: clientId,
      service_provider_id: providerId,
      rating,
      comment,
    })
    .select()
    .single()

  if (error) throw error
  return data as Review
}

export const updateReview = async (
  reviewId: string,
  rating: number,
  comment?: string
): Promise<Review> => {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      rating,
      comment,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw error
  return data as Review
}

export const deleteReview = async (reviewId: string): Promise<void> => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (error) throw error
}

// Time limit for editing reviews (in days) - same as mobile app
const REVIEW_EDIT_TIME_LIMIT_DAYS = 7

export const canEditReview = (review: Review): boolean => {
  const createdAt = new Date(review.created_at)
  const now = new Date()
  const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceCreation <= REVIEW_EDIT_TIME_LIMIT_DAYS
}

export const getEditTimeRemaining = (review: Review): { canEdit: boolean; daysRemaining: number; hoursRemaining: number } => {
  const createdAt = new Date(review.created_at)
  const expiresAt = new Date(createdAt.getTime() + REVIEW_EDIT_TIME_LIMIT_DAYS * 24 * 60 * 60 * 1000)
  const now = new Date()
  
  const msRemaining = expiresAt.getTime() - now.getTime()
  const canEdit = msRemaining > 0
  const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24))
  const hoursRemaining = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  return { canEdit, daysRemaining, hoursRemaining }
}

export const getEditableReview = async (
  clientId: string,
  providerId: string
): Promise<Review | null> => {
  const review = await getReviewByClientAndProvider(clientId, providerId)
  if (review && canEditReview(review)) {
    return review
  }
  return null
}

export const getMyReviewForProvider = async (
  clientId: string,
  providerId: string
): Promise<{ review: Review | null; canEdit: boolean; daysRemaining: number; hoursRemaining: number }> => {
  const review = await getReviewByClientAndProvider(clientId, providerId)
  if (!review) {
    return { review: null, canEdit: false, daysRemaining: 0, hoursRemaining: 0 }
  }
  const { canEdit, daysRemaining, hoursRemaining } = getEditTimeRemaining(review)
  return { review, canEdit, daysRemaining, hoursRemaining }
}

// Get all reviews sent by a specific client (with provider info)
export interface ReviewWithProvider extends Review {
  provider?: {
    id: string
    name: string
    surname?: string | null
    avatar_url?: string | null
    category?: string | null
  }
}

export const getReviewsByClientId = async (clientId: string): Promise<ReviewWithProvider[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      provider:service_provider_profiles(id, name, surname, avatar_url, category)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as unknown as ReviewWithProvider[]
}

