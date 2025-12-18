/**
 * Statistics API Service
 */

import { supabase } from '@/lib/supabase'

export interface ProviderStatistics {
  profileViews: number
  favoritesCount: number
  conversationsCount: number
  reviewsCount: number
  averageRating: number
  ratingDistribution: Record<number, number>
  portfolioCount: number
  applicationsCount: number
  acceptedApplicationsCount: number
  memberSince: string
  profileCompleteness: number
}

export interface MonthlyComparison {
  thisMonth: {
    profileViews: number
    conversations: number
    favorites: number
    reviews: number
  }
  lastMonth: {
    profileViews: number
    conversations: number
    favorites: number
    reviews: number
  }
}

export const getProviderStatistics = async (providerId: string): Promise<ProviderStatistics> => {
  const [
    profileData,
    favoritesData,
    conversationsData,
    reviewsData,
    portfolioData,
    applicationsData,
  ] = await Promise.all([
    supabase
      .from('service_provider_profiles')
      .select('profile_views_count, average_rating, total_reviews, created_at, profile_completed, name, surname, specialty, avatar_url, background_image_url, about_me, location, category, services, languages, hourly_rate_min')
      .eq('id', providerId)
      .single(),
    supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('service_provider_id', providerId),
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('service_provider_id', providerId)
      .not('last_message_at', 'is', null),
    supabase
      .from('reviews')
      .select('rating')
      .eq('service_provider_id', providerId),
    supabase
      .from('portfolio_projects')
      .select('*', { count: 'exact', head: true })
      .eq('service_provider_id', providerId),
    supabase
      .from('applications')
      .select('status')
      .eq('service_provider_id', providerId),
  ])

  // Calculate rating distribution
  const reviews = (reviewsData.data || []) as { rating: number }[]
  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach((r) => {
    ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1
  })

  // Calculate accepted applications
  const applications = (applicationsData.data || []) as { status: string }[]
  const acceptedApplicationsCount = applications.filter(
    (a) => a.status === 'accepted' || a.status === 'completed'
  ).length

  // Calculate profile completeness
  interface ProfileData {
    profile_views_count: number
    average_rating: number | null
    total_reviews: number | null
    created_at: string
    profile_completed: boolean
    name: string | null
    surname: string | null
    specialty: string | null
    avatar_url: string | null
    background_image_url: string | null
    about_me: string | null
    location: string | null
    category: string | null
    services: string[] | null
    languages: string[] | null
    hourly_rate_min: number | null
  }
  
  const profile = profileData.data as ProfileData | null
  let completeness = 0
  if (profile) {
    const fields = [
      profile.name,
      profile.surname,
      profile.specialty,
      profile.avatar_url,
      profile.background_image_url,
      profile.about_me,
      profile.location,
      profile.category,
      (profile.services?.length ?? 0) > 0,
      (profile.languages?.length ?? 0) > 0,
      profile.hourly_rate_min,
    ]
    const filledFields = fields.filter(Boolean).length
    completeness = Math.round((filledFields / fields.length) * 100)
  }

  return {
    profileViews: profile?.profile_views_count || 0,
    favoritesCount: favoritesData.count || 0,
    conversationsCount: conversationsData.count || 0,
    reviewsCount: reviews.length,
    averageRating: profile?.average_rating || 0,
    ratingDistribution,
    portfolioCount: portfolioData.count || 0,
    applicationsCount: applications.length,
    acceptedApplicationsCount,
    memberSince: profile?.created_at || new Date().toISOString(),
    profileCompleteness: completeness,
  }
}

export const getMonthlyComparison = async (providerId: string): Promise<MonthlyComparison> => {
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  const [
    thisMonthConversations,
    lastMonthConversations,
    thisMonthFavorites,
    lastMonthFavorites,
    thisMonthReviews,
    lastMonthReviews,
  ] = await Promise.all([
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('service_provider_id', providerId)
      .gte('created_at', startOfThisMonth),
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('service_provider_id', providerId)
      .gte('created_at', startOfLastMonth)
      .lte('created_at', endOfLastMonth),
    supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('service_provider_id', providerId)
      .gte('created_at', startOfThisMonth),
    supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('service_provider_id', providerId)
      .gte('created_at', startOfLastMonth)
      .lte('created_at', endOfLastMonth),
    supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('service_provider_id', providerId)
      .gte('created_at', startOfThisMonth),
    supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('service_provider_id', providerId)
      .gte('created_at', startOfLastMonth)
      .lte('created_at', endOfLastMonth),
  ])

  return {
    thisMonth: {
      profileViews: 0,
      conversations: thisMonthConversations.count || 0,
      favorites: thisMonthFavorites.count || 0,
      reviews: thisMonthReviews.count || 0,
    },
    lastMonth: {
      profileViews: 0,
      conversations: lastMonthConversations.count || 0,
      favorites: lastMonthFavorites.count || 0,
      reviews: lastMonthReviews.count || 0,
    },
  }
}

