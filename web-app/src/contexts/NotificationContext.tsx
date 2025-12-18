'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

interface NotificationContextType {
  unreadMessagesCount: number
  clientUnreadCount: number
  providerUnreadCount: number
  unreadNotificationsCount: number
  refreshUnreadCounts: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, clientProfile, serviceProviderProfile } = useAuth()
  
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [clientUnreadCount, setClientUnreadCount] = useState(0)
  const [providerUnreadCount, setProviderUnreadCount] = useState(0)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)

  // Fetch unread counts
  const refreshUnreadCounts = useCallback(async () => {
    if (!user?.id) {
      setUnreadMessagesCount(0)
      setClientUnreadCount(0)
      setProviderUnreadCount(0)
      setUnreadNotificationsCount(0)
      return
    }

    try {
      // Get unread messages for client profile
      let clientCount = 0
      if (clientProfile?.id) {
        const { data: clientConvos } = await supabase
          .from('conversations')
          .select('id')
          .eq('client_id', clientProfile.id)

        if (clientConvos) {
          for (const convo of clientConvos) {
            const { count } = await supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('conversation_id', convo.id)
              .eq('is_read', false)
              .neq('sender_id', user.id)

            clientCount += count || 0
          }
        }
      }

      // Get unread messages for provider profile
      let providerCount = 0
      if (serviceProviderProfile?.id) {
        const { data: providerConvos } = await supabase
          .from('conversations')
          .select('id')
          .eq('service_provider_id', serviceProviderProfile.id)

        if (providerConvos) {
          for (const convo of providerConvos) {
            const { count } = await supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('conversation_id', convo.id)
              .eq('is_read', false)
              .neq('sender_id', user.id)

            providerCount += count || 0
          }
        }
      }

      setClientUnreadCount(clientCount)
      setProviderUnreadCount(providerCount)
      setUnreadMessagesCount(clientCount + providerCount)

      // Get unread notifications count
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      setUnreadNotificationsCount(notifCount || 0)
    } catch (error) {
      console.error('Error fetching unread counts:', error)
    }
  }, [user?.id, clientProfile?.id, serviceProviderProfile?.id])

  // Fetch counts when auth changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshUnreadCounts()
    }
  }, [isAuthenticated, user?.id, refreshUnreadCounts])

  // Subscribe to new messages
  useEffect(() => {
    if (!user?.id) return

    const subscription = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          // Only count if not from current user
          if (payload.new.sender_id !== user.id) {
            refreshUnreadCounts()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: 'is_read=eq.true',
        },
        () => {
          refreshUnreadCounts()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          if (payload.new.user_id === user.id) {
            setUnreadNotificationsCount(prev => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id, refreshUnreadCounts])

  return (
    <NotificationContext.Provider
      value={{
        unreadMessagesCount,
        clientUnreadCount,
        providerUnreadCount,
        unreadNotificationsCount,
        refreshUnreadCounts,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

