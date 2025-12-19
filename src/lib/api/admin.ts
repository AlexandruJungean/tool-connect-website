/**
 * Admin API Functions
 * Comprehensive admin management for Tool Connect
 */

import { supabase } from '@/lib/supabase'

// ============================================
// TYPES
// ============================================

export interface AdminStats {
  totalUsers: number
  totalClients: number
  totalProviders: number
  totalActiveProviders: number
  totalConversations: number
  totalMessages: number
  totalReviews: number
  totalWorkRequests: number
  activeWorkRequests: number
  totalApplications: number
  totalReports: number
  pendingReports: number
  totalSupportRequests: number
  pendingSupportRequests: number
  totalFavorites: number
  totalBlocks: number
  bannedUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
}

export interface UserWithProfiles {
  id: string
  phone_number: string
  email: string | null
  created_at: string
  updated_at: string
  is_banned: boolean
  banned_at: string | null
  banned_reason: string | null
  is_admin: boolean
  last_active_at: string | null
  app_language: string | null
  preferred_profile_type: string | null
  push_notification_token: string | null
  expo_push_token: string | null
  client_profile?: {
    id: string
    name: string
    surname: string | null
    avatar_url: string | null
    profile_completed: boolean
  } | null
  service_provider_profile?: {
    id: string
    name: string
    surname: string | null
    avatar_url: string | null
    // specialty removed - using category instead
    category: string | null
    profile_completed: boolean
    is_visible: boolean
    is_active: boolean
  } | null
}

export interface Report {
  id: string
  reporter_id: string
  reported_service_provider_id: string
  reason: string
  details: string | null
  status: string | null
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  reporter?: {
    name: string
    surname: string | null
    avatar_url: string | null
  }
  reported_provider?: {
    name: string
    surname: string | null
    avatar_url: string | null
    category: string | null
  }
}

export interface SupportRequestAdmin {
  id: string
  user_id: string | null
  user_email: string | null
  user_phone: string | null
  user_name: string | null
  subject: string
  description: string
  profile_type: string | null
  app_version: string | null
  device_info: string | null
  status: string
  priority: string
  assigned_to: string | null
  admin_notes: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface SearchLogEntry {
  id: string
  user_id: string | null
  category: string | null
  subcategory: string | null
  location: string | null
  max_distance: number | null
  keywords: string | null
  filters_applied: Record<string, unknown> | null
  results_count: number
  created_at: string
}

export interface AnalyticsEntry {
  id: string
  service_provider_id: string
  date: string
  profile_views: number
  conversation_starts: number
  favorites_added: number
  applications_sent: number
  created_at: string
}

export interface DailyStats {
  date: string
  users: number
  providers: number
  clients: number
  messages: number
  conversations: number
  reviews: number
  workRequests: number
  applications: number
}

export interface CategoryStats {
  category: string
  count: number
}

export interface CityStats {
  city: string
  count: number
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getAdminStats(): Promise<AdminStats> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    usersRes,
    clientsRes,
    providersRes,
    activeProvidersRes,
    conversationsRes,
    messagesRes,
    reviewsRes,
    workRequestsRes,
    activeWorkRequestsRes,
    applicationsRes,
    reportsRes,
    pendingReportsRes,
    supportRes,
    pendingSupportRes,
    favoritesRes,
    blocksRes,
    bannedRes,
    newTodayRes,
    newWeekRes,
    newMonthRes,
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('client_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('service_provider_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('service_provider_profiles').select('id', { count: 'exact', head: true }).eq('is_active', true).eq('is_visible', true),
    supabase.from('conversations').select('id', { count: 'exact', head: true }),
    supabase.from('messages').select('id', { count: 'exact', head: true }),
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
    supabase.from('work_requests').select('id', { count: 'exact', head: true }),
    supabase.from('work_requests').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('applications').select('id', { count: 'exact', head: true }),
    supabase.from('reports').select('id', { count: 'exact', head: true }),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('support_requests').select('id', { count: 'exact', head: true }),
    supabase.from('support_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('favorites').select('id', { count: 'exact', head: true }),
    supabase.from('blocks').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_banned', true),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', monthAgo),
  ])

  return {
    totalUsers: usersRes.count || 0,
    totalClients: clientsRes.count || 0,
    totalProviders: providersRes.count || 0,
    totalActiveProviders: activeProvidersRes.count || 0,
    totalConversations: conversationsRes.count || 0,
    totalMessages: messagesRes.count || 0,
    totalReviews: reviewsRes.count || 0,
    totalWorkRequests: workRequestsRes.count || 0,
    activeWorkRequests: activeWorkRequestsRes.count || 0,
    totalApplications: applicationsRes.count || 0,
    totalReports: reportsRes.count || 0,
    pendingReports: pendingReportsRes.count || 0,
    totalSupportRequests: supportRes.count || 0,
    pendingSupportRequests: pendingSupportRes.count || 0,
    totalFavorites: favoritesRes.count || 0,
    totalBlocks: blocksRes.count || 0,
    bannedUsers: bannedRes.count || 0,
    newUsersToday: newTodayRes.count || 0,
    newUsersThisWeek: newWeekRes.count || 0,
    newUsersThisMonth: newMonthRes.count || 0,
  }
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function getUsers(
  page: number = 1,
  limit: number = 20,
  search: string = '',
  filter: 'all' | 'admins' | 'banned' | 'active' = 'all'
): Promise<{ users: UserWithProfiles[]; total: number }> {
  let query = supabase
    .from('users')
    .select(`
      *,
      client_profiles (id, name, surname, avatar_url, profile_completed),
      service_provider_profiles (id, name, surname, avatar_url, category, profile_completed, is_visible, is_active)
    `, { count: 'exact' })

  if (search) {
    query = query.or(`phone_number.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (filter === 'admins') {
    query = query.eq('is_admin', true)
  } else if (filter === 'banned') {
    query = query.eq('is_banned', true)
  } else if (filter === 'active') {
    query = query.eq('is_banned', false)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    users: (data || []).map(u => ({
      ...u,
      client_profile: u.client_profiles?.[0] || null,
      service_provider_profile: u.service_provider_profiles?.[0] || null,
    })) as UserWithProfiles[],
    total: count || 0,
  }
}

export async function banUser(userId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      is_banned: true,
      banned_at: new Date().toISOString(),
      banned_reason: reason,
    })
    .eq('id', userId)

  if (error) throw error
}

export async function unbanUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      is_banned: false,
      banned_at: null,
      banned_reason: null,
    })
    .eq('id', userId)

  if (error) throw error
}

export async function toggleAdmin(userId: string, isAdmin: boolean): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ is_admin: isAdmin })
    .eq('id', userId)

  if (error) throw error
}

export async function deleteUser(userId: string): Promise<void> {
  // Delete related data first
  await Promise.all([
    supabase.from('client_profiles').delete().eq('user_id', userId),
    supabase.from('service_provider_profiles').delete().eq('user_id', userId),
    supabase.from('notifications').delete().eq('user_id', userId),
    supabase.from('notification_settings').delete().eq('user_id', userId),
  ])
  
  const { error } = await supabase.from('users').delete().eq('id', userId)
  if (error) throw error
}

// ============================================
// SERVICE PROVIDER MANAGEMENT
// ============================================

export async function getServiceProviders(
  page: number = 1,
  limit: number = 20,
  search: string = '',
  category: string = '',
  status: 'all' | 'active' | 'inactive' | 'hidden' = 'all'
): Promise<{ providers: any[]; total: number }> {
  let query = supabase
    .from('service_provider_profiles')
    .select('*, users!inner(phone_number, email, is_banned, is_admin)', { count: 'exact' })

  if (search) {
    query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,city.ilike.%${search}%`)
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (status === 'active') {
    query = query.eq('is_active', true).eq('is_visible', true)
  } else if (status === 'inactive') {
    query = query.eq('is_active', false)
  } else if (status === 'hidden') {
    query = query.eq('is_visible', false)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return { providers: data || [], total: count || 0 }
}

export async function toggleProviderVisibility(providerId: string, isVisible: boolean): Promise<void> {
  const { error } = await supabase
    .from('service_provider_profiles')
    .update({ is_visible: isVisible })
    .eq('id', providerId)

  if (error) throw error
}

export async function toggleProviderActive(providerId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('service_provider_profiles')
    .update({ is_active: isActive })
    .eq('id', providerId)

  if (error) throw error
}

export async function setScamWarning(providerId: string, hasWarning: boolean): Promise<void> {
  const { error } = await supabase
    .from('service_provider_profiles')
    .update({ scam_warning: hasWarning })
    .eq('id', providerId)

  if (error) throw error
}

// ============================================
// REPORTS MANAGEMENT
// ============================================

export async function getReports(
  page: number = 1,
  limit: number = 20,
  status: 'all' | 'pending' | 'reviewed' | 'dismissed' = 'all'
): Promise<{ reports: Report[]; total: number }> {
  // First get reports
  let query = supabase
    .from('reports')
    .select('*', { count: 'exact' })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: reportsData, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  if (!reportsData || reportsData.length === 0) {
    return { reports: [], total: count || 0 }
  }

  // Get unique reporter and provider IDs
  const reporterIds = [...new Set(reportsData.map(r => r.reporter_id))]
  const providerIds = [...new Set(reportsData.map(r => r.reported_service_provider_id))]

  // Fetch reporter info (from client_profiles by id)
  const { data: reporters } = await supabase
    .from('client_profiles')
    .select('id, name, surname, avatar_url')
    .in('id', reporterIds)

  // Fetch provider info
  const { data: providers } = await supabase
    .from('service_provider_profiles')
    .select('id, name, surname, avatar_url, category')
    .in('id', providerIds)

  // Map reporters and providers to reports
  const reportersMap = new Map(reporters?.map(r => [r.id, r]) || [])
  const providersMap = new Map(providers?.map(p => [p.id, p]) || [])

  const reports = reportsData.map(report => ({
    ...report,
    reporter: reportersMap.get(report.reporter_id) || null,
    reported_provider: providersMap.get(report.reported_service_provider_id) || null,
  }))

  return { reports: reports as Report[], total: count || 0 }
}

export async function updateReportStatus(
  reportId: string,
  status: 'reviewed' | 'dismissed',
  reviewedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    })
    .eq('id', reportId)

  if (error) throw error
}

// ============================================
// SUPPORT REQUESTS MANAGEMENT
// ============================================

export async function getSupportRequests(
  page: number = 1,
  limit: number = 20,
  status: 'all' | 'pending' | 'in_progress' | 'resolved' | 'closed' = 'all',
  priority: 'all' | 'low' | 'normal' | 'high' | 'urgent' = 'all'
): Promise<{ requests: SupportRequestAdmin[]; total: number }> {
  let query = supabase
    .from('support_requests')
    .select('*', { count: 'exact' })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  if (priority !== 'all') {
    query = query.eq('priority', priority)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return { requests: (data || []) as SupportRequestAdmin[], total: count || 0 }
}

export async function updateSupportRequest(
  requestId: string,
  updates: {
    status?: string
    priority?: string
    admin_notes?: string
    assigned_to?: string
    resolved_at?: string
  }
): Promise<void> {
  const { error } = await supabase
    .from('support_requests')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) throw error
}

// ============================================
// ANALYTICS & CHARTS
// ============================================

export async function getDailyStats(days: number = 30): Promise<DailyStats[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: users } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', startDate.toISOString())

  const { data: providers } = await supabase
    .from('service_provider_profiles')
    .select('created_at')
    .gte('created_at', startDate.toISOString())

  const { data: clients } = await supabase
    .from('client_profiles')
    .select('created_at')
    .gte('created_at', startDate.toISOString())

  const { data: messages } = await supabase
    .from('messages')
    .select('created_at')
    .gte('created_at', startDate.toISOString())

  const { data: conversations } = await supabase
    .from('conversations')
    .select('created_at')
    .gte('created_at', startDate.toISOString())

  const { data: reviews } = await supabase
    .from('reviews')
    .select('created_at')
    .gte('created_at', startDate.toISOString())

  const { data: workRequests } = await supabase
    .from('work_requests')
    .select('created_at')
    .gte('created_at', startDate.toISOString())

  const { data: applications } = await supabase
    .from('applications')
    .select('created_at')
    .gte('created_at', startDate.toISOString())

  // Group by date
  const stats: Record<string, DailyStats> = {}
  
  for (let i = 0; i <= days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    stats[dateStr] = {
      date: dateStr,
      users: 0,
      providers: 0,
      clients: 0,
      messages: 0,
      conversations: 0,
      reviews: 0,
      workRequests: 0,
      applications: 0,
    }
  }

  const countByDate = (items: { created_at: string }[] | null, key: keyof DailyStats) => {
    items?.forEach(item => {
      const date = item.created_at.split('T')[0]
      if (stats[date]) {
        (stats[date][key] as number)++
      }
    })
  }

  countByDate(users, 'users')
  countByDate(providers, 'providers')
  countByDate(clients, 'clients')
  countByDate(messages, 'messages')
  countByDate(conversations, 'conversations')
  countByDate(reviews, 'reviews')
  countByDate(workRequests, 'workRequests')
  countByDate(applications, 'applications')

  return Object.values(stats).sort((a, b) => a.date.localeCompare(b.date))
}

export async function getCategoryDistribution(): Promise<CategoryStats[]> {
  const { data, error } = await supabase
    .from('service_provider_profiles')
    .select('category')
    .not('category', 'is', null)

  if (error) throw error

  const counts: Record<string, number> = {}
  data?.forEach(p => {
    if (p.category) {
      counts[p.category] = (counts[p.category] || 0) + 1
    }
  })

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getCityDistribution(): Promise<CityStats[]> {
  const { data, error } = await supabase
    .from('service_provider_profiles')
    .select('city')
    .not('city', 'is', null)
    .eq('is_active', true)

  if (error) throw error

  const counts: Record<string, number> = {}
  data?.forEach(p => {
    if (p.city) {
      counts[p.city] = (counts[p.city] || 0) + 1
    }
  })

  return Object.entries(counts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
}

export async function getSearchLogs(
  page: number = 1,
  limit: number = 50
): Promise<{ logs: SearchLogEntry[]; total: number }> {
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('search_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return { logs: (data || []) as SearchLogEntry[], total: count || 0 }
}

export async function getPopularSearchCategories(): Promise<CategoryStats[]> {
  const { data, error } = await supabase
    .from('search_logs')
    .select('category')
    .not('category', 'is', null)

  if (error) throw error

  const counts: Record<string, number> = {}
  data?.forEach(s => {
    if (s.category) {
      counts[s.category] = (counts[s.category] || 0) + 1
    }
  })

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

export async function getReviewsOverview(): Promise<{
  total: number
  averageRating: number
  distribution: { rating: number; count: number }[]
}> {
  const { data, error, count } = await supabase
    .from('reviews')
    .select('rating', { count: 'exact' })

  if (error) throw error

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let totalRating = 0

  data?.forEach(r => {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1
    totalRating += r.rating
  })

  return {
    total: count || 0,
    averageRating: count ? totalRating / count : 0,
    distribution: Object.entries(distribution).map(([rating, count]) => ({
      rating: parseInt(rating),
      count,
    })),
  }
}

// ============================================
// WORK REQUESTS
// ============================================

export async function getWorkRequests(
  page: number = 1,
  limit: number = 20,
  status: 'all' | 'active' | 'paused' | 'closed' | 'completed' = 'all'
): Promise<{ requests: any[]; total: number }> {
  let query = supabase
    .from('work_requests')
    .select(`
      *,
      client:client_profiles!client_id(name, surname, avatar_url)
    `, { count: 'exact' })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return { requests: data || [], total: count || 0 }
}

// ============================================
// MESSAGES & CONVERSATIONS
// ============================================

export async function getConversationsOverview(): Promise<{
  total: number
  activeToday: number
  blockedCount: number
}> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalRes, activeTodayRes, blockedRes] = await Promise.all([
    supabase.from('conversations').select('id', { count: 'exact', head: true }),
    supabase.from('conversations').select('id', { count: 'exact', head: true }).gte('last_message_at', today.toISOString()),
    supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('is_blocked', true),
  ])

  return {
    total: totalRes.count || 0,
    activeToday: activeTodayRes.count || 0,
    blockedCount: blockedRes.count || 0,
  }
}

export async function getRecentMessages(limit: number = 50): Promise<any[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      conversation:conversations(
        client:client_profiles!client_id(name, surname),
        provider:service_provider_profiles!service_provider_id(name, surname)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// ============================================
// NOTIFICATIONS MANAGEMENT
// ============================================

export async function sendBroadcastNotification(
  title: string,
  message: string,
  targetType: 'all' | 'clients' | 'providers',
  isUrgent: boolean = false
): Promise<number> {
  let userIds: string[] = []

  if (targetType === 'all' || targetType === 'clients') {
    const { data: clients } = await supabase
      .from('client_profiles')
      .select('user_id')
      .eq('is_active', true)
    
    userIds.push(...(clients?.map(c => c.user_id) || []))
  }

  if (targetType === 'all' || targetType === 'providers') {
    const { data: providers } = await supabase
      .from('service_provider_profiles')
      .select('user_id')
      .eq('is_active', true)
    
    userIds.push(...(providers?.map(p => p.user_id) || []))
  }

  // Remove duplicates
  userIds = [...new Set(userIds)]

  if (userIds.length === 0) return 0

  const notifications = userIds.map(userId => ({
    user_id: userId,
    type: 'admin_broadcast',
    title,
    message,
    is_urgent: isUrgent,
    data: { broadcast: true },
  }))

  const { error } = await supabase.from('notifications').insert(notifications)

  if (error) throw error

  return notifications.length
}

// ============================================
// CHECK ADMIN STATUS
// ============================================

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (error) return false
  return data?.is_admin === true
}

