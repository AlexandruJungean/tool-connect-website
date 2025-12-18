/**
 * Blocks and Reports API Service
 */

import { supabase } from '@/lib/supabase'

export interface Block {
  id: string
  blocker_id: string
  blocked_id: string
  blocker_profile_type: 'client' | 'service_provider'
  blocked_profile_type: 'client' | 'service_provider'
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  reported_service_provider_id: string
  reason: string
  details?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
}

// ============ Blocks ============

export const getBlockedUsers = async (userId: string): Promise<Block[]> => {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('blocker_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Block[]
}

export const getBlockedProviderUserIds = async (userId: string): Promise<Set<string>> => {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', userId)
    .eq('blocked_profile_type', 'service_provider')

  if (error) throw error
  return new Set((data || []).map((b: { blocked_id: string }) => b.blocked_id))
}

export const getBlockedClientUserIds = async (userId: string): Promise<Set<string>> => {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', userId)
    .eq('blocked_profile_type', 'client')

  if (error) throw error
  return new Set((data || []).map((b: { blocked_id: string }) => b.blocked_id))
}

export const isBlocked = async (blockerId: string, blockedId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('blocks')
    .select('id')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

export const isBlockedByOrBlocking = async (userId1: string, userId2: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('blocks')
    .select('id')
    .or(`and(blocker_id.eq.${userId1},blocked_id.eq.${userId2}),and(blocker_id.eq.${userId2},blocked_id.eq.${userId1})`)

  if (error) throw error
  return (data || []).length > 0
}

export const blockUser = async (
  blockerId: string,
  blockedId: string,
  blockerProfileType: 'client' | 'service_provider' = 'client',
  blockedProfileType: 'client' | 'service_provider' = 'service_provider'
): Promise<Block> => {
  const { data, error } = await supabase
    .from('blocks')
    .insert({
      blocker_id: blockerId,
      blocked_id: blockedId,
      blocker_profile_type: blockerProfileType,
      blocked_profile_type: blockedProfileType,
    })
    .select()
    .single()

  if (error) throw error
  return data as Block
}

export const unblockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)

  if (error) throw error
}

// ============ Reports ============

export const createReport = async (
  reporterId: string,
  reportedProviderId: string,
  reason: string,
  details?: string
): Promise<Report> => {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: reporterId,
      reported_service_provider_id: reportedProviderId,
      reason,
      details,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data as Report
}

export const getMyReports = async (reporterId: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', reporterId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Report[]
}

export const hasReported = async (reporterId: string, providerId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', reporterId)
    .eq('reported_service_provider_id', providerId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

