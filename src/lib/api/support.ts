/**
 * Support Requests API Service
 */

import { supabase } from '@/lib/supabase'

export const SUPPORT_EMAIL = 'support@tool-connect.com'

export interface SupportRequest {
  id: string
  user_id?: string
  user_email?: string
  user_phone?: string
  user_name?: string
  subject: string
  description: string
  profile_type?: 'client' | 'service_provider' | 'guest'
  app_version?: string
  device_info?: string
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  updated_at?: string
}

export interface CreateSupportRequestParams {
  userId?: string
  userEmail?: string
  userPhone?: string
  userName?: string
  subject: string
  description: string
  profileType?: 'client' | 'service_provider' | 'guest'
  appVersion?: string
  deviceInfo?: string
}

export const createSupportRequest = async (
  params: CreateSupportRequestParams
): Promise<SupportRequest> => {
  const { data, error } = await supabase
    .from('support_requests')
    .insert({
      user_id: params.userId || null,
      user_email: params.userEmail || null,
      user_phone: params.userPhone || null,
      user_name: params.userName || null,
      subject: params.subject,
      description: params.description,
      profile_type: params.profileType || null,
      app_version: params.appVersion || null,
      device_info: params.deviceInfo || null,
      status: 'pending',
      priority: 'normal',
    })
    .select()
    .single()

  if (error) throw error
  return data as SupportRequest
}

export const getUserSupportRequests = async (userId: string): Promise<SupportRequest[]> => {
  const { data, error } = await supabase
    .from('support_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as SupportRequest[]
}

export const getSupportRequestById = async (requestId: string): Promise<SupportRequest | null> => {
  const { data, error } = await supabase
    .from('support_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as SupportRequest
}

