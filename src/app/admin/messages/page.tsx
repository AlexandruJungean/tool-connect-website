'use client'

import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  Image,
  FileText,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { getRecentMessages, getConversationsOverview } from '@/lib/api/admin'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [overview, setOverview] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const limit = 50
  const totalPages = Math.ceil(total / limit)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [messagesData, overviewData, countData] = await Promise.all([
        getRecentMessages(limit),
        getConversationsOverview(),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
      ])
      setMessages(messagesData)
      setOverview(overviewData)
      setTotal(countData.count || 0)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-gray-400">Monitor platform messaging activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{total.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">Total Messages</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{overview?.total.toLocaleString() || 0}</p>
          <p className="text-gray-400 text-sm">Conversations</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{overview?.activeToday || 0}</p>
          <p className="text-gray-400 text-sm">Active Today</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{overview?.blockedCount || 0}</p>
          <p className="text-gray-400 text-sm">Blocked</p>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Recent Messages</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No messages found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {messages.map((message) => (
              <div key={message.id} className="p-4 hover:bg-gray-700/30">
                <div className="flex items-start gap-4">
                  {/* Sender Info */}
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium truncate">
                        {message.conversation?.client?.name || message.conversation?.provider?.name || 'Unknown'}
                      </span>
                      <span className="text-gray-500">→</span>
                      <span className="text-gray-400 truncate">
                        {message.conversation?.provider?.name || message.conversation?.client?.name || 'Unknown'}
                      </span>
                      <span className="text-gray-500 text-sm ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(message.created_at)}
                      </span>
                    </div>

                    {/* Message Content */}
                    <div className="flex items-start gap-2">
                      {message.message_text && (
                        <p className="text-gray-300 text-sm line-clamp-2">{message.message_text}</p>
                      )}
                      {message.attachment_url && (
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          {message.attachment_type?.startsWith('image') ? (
                            <Image className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                          <span>{message.attachment_name || 'Attachment'}</span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {message.is_read ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Read
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          Unread
                        </span>
                      )}
                      {message.deleted_by_sender && (
                        <span className="text-red-400">Deleted by sender</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="p-4 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            Showing last {messages.length} messages of {total.toLocaleString()} total
          </p>
        </div>
      </div>
    </div>
  )
}

