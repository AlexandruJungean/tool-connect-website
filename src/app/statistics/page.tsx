'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Eye, 
  Heart, 
  MessageCircle, 
  Star, 
  Briefcase, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Shield,
  Lightbulb,
  RefreshCw
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/ui'
import { AlertCard } from '@/components/cards'
import { getProviderStatistics, getMonthlyComparison, ProviderStatistics, MonthlyComparison } from '@/lib/api/statistics'

export default function StatisticsPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { serviceProviderProfile } = useAuth()

  const [stats, setStats] = useState<ProviderStatistics | null>(null)
  const [comparison, setComparison] = useState<MonthlyComparison | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = {
    title: language === 'cs' ? 'Statistiky' : 'Statistics',
    subtitle: language === 'cs' ? 'Přehled vašeho profilu' : 'Your profile overview',
    keyMetrics: language === 'cs' ? 'Klíčové metriky' : 'Key Metrics',
    profileViews: language === 'cs' ? 'Zobrazení profilu' : 'Profile Views',
    profileViewsDesc: language === 'cs' ? 'Kolikrát byl váš profil zobrazen' : 'Times your profile was viewed',
    favorites: language === 'cs' ? 'V oblíbených' : 'Favorited',
    favoritesDesc: language === 'cs' ? 'Uživatelé, kteří si vás přidali do oblíbených' : 'Users who added you to favorites',
    conversations: language === 'cs' ? 'Konverzace' : 'Conversations',
    conversationsDesc: language === 'cs' ? 'Celkový počet konverzací' : 'Total number of conversations',
    reviews: language === 'cs' ? 'Recenze' : 'Reviews',
    reviewsDesc: language === 'cs' ? 'Celkový počet recenzí' : 'Total number of reviews',
    ratingBreakdown: language === 'cs' ? 'Rozložení hodnocení' : 'Rating Breakdown',
    basedOn: language === 'cs' ? 'Na základě {count} recenzí' : 'Based on {count} reviews',
    workStats: language === 'cs' ? 'Statistiky práce' : 'Work Stats',
    applications: language === 'cs' ? 'Přihlášky' : 'Applications',
    applicationsDesc: language === 'cs' ? 'Celkový počet přihlášek' : 'Total applications submitted',
    acceptedJobs: language === 'cs' ? 'Přijatá práce' : 'Accepted Jobs',
    acceptedJobsDesc: language === 'cs' ? 'Práce, které jste získali' : 'Jobs you were hired for',
    accountInfo: language === 'cs' ? 'Informace o účtu' : 'Account Info',
    memberSince: language === 'cs' ? 'Členem od' : 'Member Since',
    profileStatus: language === 'cs' ? 'Stav profilu' : 'Profile Status',
    active: language === 'cs' ? 'Aktivní' : 'Active',
    profileCompleteness: language === 'cs' ? 'Dokončenost profilu' : 'Profile Completeness',
    complete: language === 'cs' ? 'kompletní' : 'complete',
    completeProfile: language === 'cs' ? 'Dokončit profil' : 'Complete Profile',
    tips: language === 'cs' ? 'Tipy pro zlepšení' : 'Tips to Improve',
    tip1: language === 'cs' ? 'Přidejte profesionální fotky portfolia' : 'Add professional portfolio photos',
    tip2: language === 'cs' ? 'Odpovídejte na zprávy rychle' : 'Respond to messages quickly',
    tip3: language === 'cs' ? 'Udržujte aktuální informace o dostupnosti' : 'Keep your availability info up to date',
    tip4: language === 'cs' ? 'Požádejte spokojené klienty o recenze' : 'Ask satisfied clients for reviews',
    noProviderProfile: language === 'cs' 
      ? 'Pro zobrazení statistik potřebujete profil poskytovatele'
      : 'You need a provider profile to view statistics',
    lessThanMonth: language === 'cs' ? 'Méně než měsíc' : 'Less than a month',
    oneMonth: language === 'cs' ? '1 měsíc' : '1 month',
    months: language === 'cs' ? '{count} měsíců' : '{count} months',
    oneYear: language === 'cs' ? '1 rok' : '1 year',
    years: language === 'cs' ? '{count} let' : '{count} years',
    refresh: language === 'cs' ? 'Obnovit' : 'Refresh',
  }

  const fetchStats = useCallback(async () => {
    if (!serviceProviderProfile?.id) {
      setIsLoading(false)
      return
    }

    try {
      const [statsData, comparisonData] = await Promise.all([
        getProviderStatistics(serviceProviderProfile.id),
        getMonthlyComparison(serviceProviderProfile.id),
      ])
      setStats(statsData)
      setComparison(comparisonData)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch statistics:', err)
      setError(language === 'cs' 
        ? 'Nepodařilo se načíst statistiky'
        : 'Failed to load statistics')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [serviceProviderProfile?.id, language])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchStats()
  }

  // Calculate trend percentage
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  // Format member since as duration
  const formatMemberSince = (dateString: string): string => {
    const date = new Date(dateString)
    const months = Math.floor(
      (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    
    if (months < 1) return t.lessThanMonth
    if (months === 1) return t.oneMonth
    if (months < 12) return t.months.replace('{count}', months.toString())
    
    const years = Math.floor(months / 12)
    if (years === 1) return t.oneYear
    return t.years.replace('{count}', years.toString())
  }

  if (!serviceProviderProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AlertCard variant="info" message={t.noProviderProfile} />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <AlertCard variant="error" message={error} className="mb-4" />
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Profile Completeness */}
            {stats.profileCompleteness < 100 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">{t.profileCompleteness}</h3>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${stats.profileCompleteness}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {stats.profileCompleteness}% {t.complete}
                </p>
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t.completeProfile}
                </button>
              </div>
            )}

            {/* Key Metrics Section */}
            <h2 className="text-base font-semibold text-gray-900">{t.keyMetrics}</h2>
            
            <div className="space-y-3">
              <StatCard
                icon={Eye}
                label={t.profileViews}
                subtitle={t.profileViewsDesc}
                value={stats.profileViews}
                iconColor="text-blue-500"
                bgColor="bg-blue-100"
              />
              <StatCard
                icon={Heart}
                label={t.favorites}
                subtitle={t.favoritesDesc}
                value={stats.favoritesCount}
                iconColor="text-red-500"
                bgColor="bg-red-100"
                trend={comparison ? calculateTrend(comparison.thisMonth.favorites, comparison.lastMonth.favorites) : undefined}
              />
              <StatCard
                icon={MessageCircle}
                label={t.conversations}
                subtitle={t.conversationsDesc}
                value={stats.conversationsCount}
                iconColor="text-green-500"
                bgColor="bg-green-100"
                trend={comparison ? calculateTrend(comparison.thisMonth.conversations, comparison.lastMonth.conversations) : undefined}
              />
              <StatCard
                icon={Star}
                label={t.reviews}
                subtitle={t.reviewsDesc}
                value={stats.reviewsCount}
                iconColor="text-yellow-500"
                bgColor="bg-yellow-100"
                trend={comparison ? calculateTrend(comparison.thisMonth.reviews, comparison.lastMonth.reviews) : undefined}
              />
            </div>

            {/* Rating Breakdown */}
            {stats.reviewsCount > 0 && (
              <>
                <h2 className="text-base font-semibold text-gray-900">{t.ratingBreakdown}</h2>
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Rating Overview */}
                    <div className="flex flex-col items-center sm:pr-6 sm:border-r border-gray-100">
                      <span className="text-5xl font-bold text-gray-900">
                        {stats.averageRating?.toFixed(1) || '0.0'}
                      </span>
                      <div className="flex gap-0.5 my-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const rating = stats.averageRating || 0
                          const fullStars = Math.floor(rating)
                          const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75
                          const roundUp = rating % 1 >= 0.75
                          
                          let filled = false
                          let half = false
                          
                          if (star <= fullStars || (star === fullStars + 1 && roundUp)) {
                            filled = true
                          } else if (star === fullStars + 1 && hasHalfStar) {
                            half = true
                          }
                          
                          return (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${filled || half ? 'text-primary-600 fill-primary-600' : 'text-gray-300'}`}
                              style={half ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
                            />
                          )
                        })}
                      </div>
                      <span className="text-xs text-gray-500">
                        {t.basedOn.replace('{count}', stats.reviewsCount.toString())}
                      </span>
                    </div>
                    
                    {/* Rating Distribution */}
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.ratingDistribution[rating] || 0
                        const percentage = stats.reviewsCount > 0 
                          ? (count / stats.reviewsCount) * 100 
                          : 0
                        return (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="w-3 text-sm text-gray-600">{rating}</span>
                            <Star className="w-3 h-3 text-primary-600 fill-primary-600" />
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-6 text-xs text-gray-500 text-right">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Work Stats Section */}
            <h2 className="text-base font-semibold text-gray-900">{t.workStats}</h2>
            
            <div className="space-y-3">
              <StatCard
                icon={Briefcase}
                label={t.applications}
                subtitle={t.applicationsDesc}
                value={stats.applicationsCount}
                iconColor="text-purple-500"
                bgColor="bg-purple-100"
              />
              <StatCard
                icon={CheckCircle}
                label={t.acceptedJobs}
                subtitle={t.acceptedJobsDesc}
                value={stats.acceptedApplicationsCount}
                iconColor="text-green-500"
                bgColor="bg-green-100"
              />
            </div>

            {/* Account Info Section */}
            <h2 className="text-base font-semibold text-gray-900">{t.accountInfo}</h2>
            
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-3 py-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="flex-1 text-gray-600">{t.memberSince}</span>
                <span className="font-medium text-gray-900">
                  {formatMemberSince(stats.memberSince)}
                </span>
              </div>
              <div className="h-px bg-gray-100 my-3" />
              <div className="flex items-center gap-3 py-2">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="flex-1 text-gray-600">{t.profileStatus}</span>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-600">{t.active}</span>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">{t.tips}</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• {t.tip1}</li>
                <li>• {t.tip2}</li>
                <li>• {t.tip3}</li>
                <li>• {t.tip4}</li>
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  subtitle: string
  value: number | string
  iconColor: string
  bgColor: string
  trend?: number
}

function StatCard({ icon: Icon, label, subtitle, value, iconColor, bgColor, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      {trend !== undefined && trend !== 0 && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          {trend > 0 ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(trend)}%
          </span>
        </div>
      )}
    </div>
  )
}
