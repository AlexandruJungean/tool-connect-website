'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Notification } from '@/types/database'
import { formatTimeAgo } from '@/lib/utils'
import { LoadingSpinner, EmptyState } from '@/components/ui'
import { 
  Bell, 
  MessageSquare, 
  Star, 
  FileText, 
  User,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not authenticated (only after auth loading is complete)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/platform/login?redirect=/platform/notifications'
    }
  }, [isAuthenticated, authLoading])

  // Fetch notifications when authenticated
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error
        setNotifications(data || [])
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [isAuthenticated, authLoading, user])

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return
    
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false)

      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message':
        return { icon: MessageSquare, color: 'bg-blue-100 text-blue-600' }
      case 'new_review':
        return { icon: Star, color: 'bg-primary-100 text-primary-600' }
      case 'new_application':
        return { icon: FileText, color: 'bg-green-100 text-green-600' }
      case 'profile_view':
        return { icon: User, color: 'bg-purple-100 text-purple-600' }
      default:
        return { icon: Bell, color: 'bg-gray-100 text-gray-600' }
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    
    // Navigate based on notification type
    if (notification.data?.conversation_id) {
      router.push(`/messages?conversation=${notification.data.conversation_id}`)
    } else if (notification.data?.request_id) {
      router.push(`/requests/${notification.data.request_id}`)
    } else if (notification.data?.provider_id) {
      router.push(`/providers/${notification.data.provider_id}`)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'cs' ? 'Oznámení' : 'Notifications'}
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-primary-700 hover:text-primary-800 text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              {language === 'cs' ? 'Označit vše jako přečtené' : 'Mark all as read'}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-100">
            {notifications.map((notification) => {
              const { icon: Icon, color } = getNotificationIcon(notification.type)
              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left",
                    !notification.is_read && "bg-primary-50"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-gray-900",
                      !notification.is_read && "font-medium"
                    )}>
                      {notification.title}
                    </p>
                    {(notification.message || notification.body) && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {notification.message || notification.body}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(notification.created_at, language)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-2" />
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title={language === 'cs' ? 'Žádná oznámení' : 'No notifications'}
            description={language === 'cs' 
              ? 'Budeme vás informovat o důležitých událostech'
              : "We'll notify you about important events"
            }
          />
        )}
      </div>
    </div>
  )
}

