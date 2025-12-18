'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Briefcase,
  UserCircle,
  MessageSquare,
  FileText,
  Star,
  AlertTriangle,
  HeadphonesIcon,
  Heart,
  Ban,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  Clock,
} from 'lucide-react'
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
} from 'recharts'
import { getAdminStats, getDailyStats, getCategoryDistribution, getCityDistribution, getReviewsOverview, AdminStats, DailyStats, CategoryStats, CityStats } from '@/lib/api/admin'
import { LoadingSpinner } from '@/components/ui'
import { getCategoryLabel } from '@/constants/categories'
import { cn } from '@/lib/utils'

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#84cc16', '#f97316']

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  change?: number
  changeLabel?: string
  href?: string
  color?: 'primary' | 'green' | 'blue' | 'yellow' | 'red' | 'purple'
}

function StatCard({ label, value, icon: Icon, change, changeLabel, href, color = 'primary' }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }

  const content = (
    <div className={cn(
      'bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors',
      href && 'cursor-pointer'
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm',
              change >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{change >= 0 ? '+' : ''}{change}%</span>
              {changeLabel && <span className="text-gray-500">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg border', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {href && (
        <div className="mt-4 pt-3 border-t border-gray-700 flex items-center text-primary-400 text-sm font-medium">
          View details
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [categoryDist, setCategoryDist] = useState<CategoryStats[]>([])
  const [cityDist, setCityDist] = useState<CityStats[]>([])
  const [reviewsData, setReviewsData] = useState<{ total: number; averageRating: number; distribution: { rating: number; count: number }[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeChart, setActiveChart] = useState<'users' | 'messages' | 'activity'>('users')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, dailyData, categoryData, cityData, reviewData] = await Promise.all([
          getAdminStats(),
          getDailyStats(30),
          getCategoryDistribution(),
          getCityDistribution(),
          getReviewsOverview(),
        ])
        setStats(statsData)
        setDailyStats(dailyData)
        setCategoryDist(categoryData.slice(0, 10))
        setCityDist(cityData)
        setReviewsData(reviewData)
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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
        <p className="text-gray-400">Failed to load dashboard data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome to Tool Connect Admin Panel</p>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          change={stats.newUsersThisWeek > 0 ? Math.round((stats.newUsersThisWeek / stats.totalUsers) * 100) : 0}
          changeLabel="this week"
          href="/admin/users"
          color="primary"
        />
        <StatCard
          label="Service Providers"
          value={stats.totalProviders}
          icon={Briefcase}
          href="/admin/providers"
          color="blue"
        />
        <StatCard
          label="Active Providers"
          value={stats.totalActiveProviders}
          icon={Activity}
          color="green"
        />
        <StatCard
          label="Total Messages"
          value={stats.totalMessages}
          icon={MessageSquare}
          href="/admin/messages"
          color="purple"
        />
      </div>

      {/* Second Row Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Work Requests"
          value={stats.totalWorkRequests}
          icon={FileText}
          href="/admin/work-requests"
          color="yellow"
        />
        <StatCard
          label="Active Requests"
          value={stats.activeWorkRequests}
          icon={Activity}
          color="green"
        />
        <StatCard
          label="Total Reviews"
          value={stats.totalReviews}
          icon={Star}
          href="/admin/reviews"
          color="yellow"
        />
        <StatCard
          label="Favorites"
          value={stats.totalFavorites}
          icon={Heart}
          color="red"
        />
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Reports"
          value={stats.pendingReports}
          icon={AlertTriangle}
          href="/admin/reports"
          color={stats.pendingReports > 0 ? 'red' : 'green'}
        />
        <StatCard
          label="Pending Support"
          value={stats.pendingSupportRequests}
          icon={HeadphonesIcon}
          href="/admin/support"
          color={stats.pendingSupportRequests > 0 ? 'yellow' : 'green'}
        />
        <StatCard
          label="Banned Users"
          value={stats.bannedUsers}
          icon={Ban}
          color="red"
        />
        <StatCard
          label="User Blocks"
          value={stats.totalBlocks}
          icon={Ban}
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Growth Trends (30 Days)</h3>
            <div className="flex gap-2">
              {(['users', 'messages', 'activity'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveChart(type)}
                  className={cn(
                    'px-3 py-1 text-sm rounded-lg transition-colors',
                    activeChart === type
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  )}
                >
                  {type === 'users' ? 'Users' : type === 'messages' ? 'Messages' : 'Activity'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              {activeChart === 'users' ? (
                <AreaChart data={dailyStats}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProviders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="users" name="New Users" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="providers" name="New Providers" stroke="#06b6d4" fillOpacity={1} fill="url(#colorProviders)" />
                </AreaChart>
              ) : activeChart === 'messages' ? (
                <AreaChart data={dailyStats}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="messages" name="Messages" stroke="#10b981" fillOpacity={1} fill="url(#colorMessages)" />
                  <Area type="monotone" dataKey="conversations" name="New Conversations" stroke="#f59e0b" fillOpacity={0.5} fill="#f59e0b22" />
                </AreaChart>
              ) : (
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="workRequests" name="Work Requests" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="applications" name="Applications" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="reviews" name="Reviews" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Providers by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={categoryDist as any[]}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }: { name?: string; percent?: number }) => `${getCategoryLabel(name || '', 'en').slice(0, 10)}... ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryDist.map((entry, index) => (
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
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Cities */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Top Cities</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={cityDist.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis type="category" dataKey="city" stroke="#9ca3af" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reviews Distribution */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Review Ratings</h3>
          {reviewsData && (
            <>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-yellow-400">{reviewsData.averageRating.toFixed(1)}</div>
                <div className="text-gray-400 text-sm">Average Rating</div>
                <div className="text-gray-500 text-xs">{reviewsData.total} total reviews</div>
              </div>
              <div className="space-y-2">
                {reviewsData.distribution.reverse().map((item) => (
                  <div key={item.rating} className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm w-8">{item.rating}★</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full rounded-full"
                        style={{ width: `${reviewsData.total > 0 ? (item.count / reviewsData.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-sm w-10 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400">New Users Today</span>
              <span className="text-xl font-bold text-green-400">+{stats.newUsersToday}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400">New Users This Week</span>
              <span className="text-xl font-bold text-blue-400">+{stats.newUsersThisWeek}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400">New Users This Month</span>
              <span className="text-xl font-bold text-purple-400">+{stats.newUsersThisMonth}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400">Total Conversations</span>
              <span className="text-xl font-bold text-white">{stats.totalConversations.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400">Total Applications</span>
              <span className="text-xl font-bold text-white">{stats.totalApplications.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

