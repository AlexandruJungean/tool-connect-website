'use client'

import React, { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ComposedChart,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Star,
  FileText,
  Activity,
  Calendar,
  Download,
} from 'lucide-react'
import {
  getAdminStats,
  getDailyStats,
  getCategoryDistribution,
  getCityDistribution,
  getReviewsOverview,
  getPopularSearchCategories,
  getConversationsOverview,
  AdminStats,
  DailyStats,
  CategoryStats,
  CityStats,
} from '@/lib/api/admin'
import { LoadingSpinner } from '@/components/ui'
import { getCategoryLabel } from '@/constants/categories'
import { cn } from '@/lib/utils'

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#84cc16', '#f97316']

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [categoryDist, setCategoryDist] = useState<CategoryStats[]>([])
  const [cityDist, setCityDist] = useState<CityStats[]>([])
  const [searchCategories, setSearchCategories] = useState<CategoryStats[]>([])
  const [reviewsData, setReviewsData] = useState<any>(null)
  const [conversationsData, setConversationsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState(30)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [
          statsData,
          dailyData,
          categoryData,
          cityData,
          searchData,
          reviewData,
          convoData,
        ] = await Promise.all([
          getAdminStats(),
          getDailyStats(dateRange),
          getCategoryDistribution(),
          getCityDistribution(),
          getPopularSearchCategories(),
          getReviewsOverview(),
          getConversationsOverview(),
        ])

        setStats(statsData)
        setDailyStats(dailyData)
        setCategoryDist(categoryData)
        setCityDist(cityData)
        setSearchCategories(searchData)
        setReviewsData(reviewData)
        setConversationsData(convoData)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load analytics data.</p>
      </div>
    )
  }

  // Calculate cumulative data for growth chart
  const cumulativeData = dailyStats.reduce((acc: any[], stat, index) => {
    const prev = acc[index - 1] || { cumUsers: 0, cumProviders: 0, cumMessages: 0 }
    acc.push({
      ...stat,
      cumUsers: prev.cumUsers + stat.users,
      cumProviders: prev.cumProviders + stat.providers,
      cumMessages: prev.cumMessages + stat.messages,
    })
    return acc
  }, [])

  // Engagement metrics for radial chart
  const engagementData = [
    { name: 'Messages', value: Math.min(100, (stats.totalMessages / (stats.totalUsers || 1)) * 10), fill: '#8b5cf6' },
    { name: 'Reviews', value: Math.min(100, (stats.totalReviews / (stats.totalProviders || 1)) * 20), fill: '#10b981' },
    { name: 'Favorites', value: Math.min(100, (stats.totalFavorites / (stats.totalClients || 1)) * 15), fill: '#f59e0b' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
          <p className="text-gray-400">Comprehensive insights and metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'primary' },
          { label: 'Providers', value: stats.totalProviders, icon: Users, color: 'blue' },
          { label: 'Messages', value: stats.totalMessages, icon: MessageSquare, color: 'green' },
          { label: 'Reviews', value: stats.totalReviews, icon: Star, color: 'yellow' },
          { label: 'Work Requests', value: stats.totalWorkRequests, icon: FileText, color: 'purple' },
          { label: 'Applications', value: stats.totalApplications, icon: Activity, color: 'cyan' },
        ].map((metric) => (
          <div key={metric.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={cn('w-5 h-5', `text-${metric.color}-400`)} />
            </div>
            <p className="text-2xl font-bold text-white">{metric.value.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Over Time */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">User Growth (Cumulative)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="colorCumUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="cumUsers" name="Total New Users" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCumUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity by Day */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Activity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <ComposedChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="messages" name="Messages" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Line type="monotone" dataKey="conversations" name="Conversations" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Providers by Category</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={categoryDist.slice(0, 8) as any[]}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {categoryDist.slice(0, 8).map((entry, index) => (
                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value, name) => [value as number, getCategoryLabel(String(name), 'en')]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {categoryDist.slice(0, 6).map((cat, idx) => (
              <div key={cat.category} className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-gray-400">{getCategoryLabel(cat.category, 'en').slice(0, 15)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Top Cities</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={cityDist.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis type="category" dataKey="city" stroke="#9ca3af" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Searches */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Popular Search Categories</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={searchCategories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9ca3af" fontSize={10} angle={-45} textAnchor="end" height={80} tickFormatter={(v) => getCategoryLabel(v, 'en').slice(0, 10)} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value) => [value as number, 'Searches']}
                  labelFormatter={(label) => getCategoryLabel(String(label), 'en')}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reviews Distribution */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Review Ratings Distribution</h3>
          {reviewsData && (
            <>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-yellow-400">{reviewsData.averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'w-5 h-5',
                        star <= Math.round(reviewsData.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                      )}
                    />
                  ))}
                </div>
                <div className="text-gray-500 text-sm mt-1">{reviewsData.total} total reviews</div>
              </div>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviewsData.distribution.find((d: any) => d.rating === rating)?.count || 0
                  const percent = reviewsData.total > 0 ? (count / reviewsData.total) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm w-6">{rating}★</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-12 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Engagement Metrics */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Engagement Score</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="100%"
                barSize={20}
                data={engagementData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar dataKey="value" background cornerRadius={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value) => [`${(value as number).toFixed(0)}%`, 'Score']}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {engagementData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Stats */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Conversation Stats</h3>
          {conversationsData && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Conversations</span>
                  <span className="text-2xl font-bold text-white">{conversationsData.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Today</span>
                  <span className="text-2xl font-bold text-green-400">{conversationsData.activeToday}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Blocked Conversations</span>
                  <span className="text-2xl font-bold text-red-400">{conversationsData.blockedCount}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg Messages/User</span>
                  <span className="text-2xl font-bold text-blue-400">
                    {stats.totalUsers > 0 ? (stats.totalMessages / stats.totalUsers).toFixed(1) : 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Work Requests & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Work Requests Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorWR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="workRequests" name="Work Requests" stroke="#f59e0b" fillOpacity={1} fill="url(#colorWR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Applications Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="applications" name="Applications" stroke="#ef4444" fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

