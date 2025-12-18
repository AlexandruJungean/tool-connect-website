'use client'

import React, { useState } from 'react'
import {
  Bell,
  Send,
  Users,
  Briefcase,
  UserCircle,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { sendBroadcastNotification } from '@/lib/api/admin'
import { LoadingSpinner } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetType, setTargetType] = useState<'all' | 'clients' | 'providers'>('all')
  const [isUrgent, setIsUrgent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; count: number } | null>(null)

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return

    setIsLoading(true)
    setResult(null)
    try {
      const count = await sendBroadcastNotification(title, message, targetType, isUrgent)
      setResult({ success: true, count })
      setTitle('')
      setMessage('')
      setIsUrgent(false)
    } catch (error) {
      console.error('Error sending notification:', error)
      setResult({ success: false, count: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-gray-400">Send broadcast notifications to users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Broadcast Notification
          </h3>

          <div className="space-y-4">
            {/* Target Audience */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Target Audience</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTargetType('all')}
                  className={cn(
                    'p-3 rounded-lg border transition-colors flex flex-col items-center gap-2',
                    targetType === 'all'
                      ? 'bg-primary-600 border-primary-500 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                  )}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-sm">All Users</span>
                </button>
                <button
                  onClick={() => setTargetType('clients')}
                  className={cn(
                    'p-3 rounded-lg border transition-colors flex flex-col items-center gap-2',
                    targetType === 'clients'
                      ? 'bg-primary-600 border-primary-500 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                  )}
                >
                  <UserCircle className="w-5 h-5" />
                  <span className="text-sm">Clients Only</span>
                </button>
                <button
                  onClick={() => setTargetType('providers')}
                  className={cn(
                    'p-3 rounded-lg border transition-colors flex flex-col items-center gap-2',
                    targetType === 'providers'
                      ? 'bg-primary-600 border-primary-500 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                  )}
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="text-sm">Providers Only</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Notification Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                maxLength={100}
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter notification message..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-gray-500 text-xs mt-1">{message.length}/500 characters</p>
            </div>

            {/* Urgent Flag */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsUrgent(!isUrgent)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                  isUrgent
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                )}
              >
                <AlertTriangle className="w-4 h-4" />
                Mark as Urgent
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!title.trim() || !message.trim() || isLoading}
              className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Notification
                </>
              )}
            </button>

            {/* Result */}
            {result && (
              <div className={cn(
                'p-4 rounded-lg flex items-center gap-3',
                result.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              )}>
                {result.success ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Successfully sent to {result.count} users!
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    Failed to send notification. Please try again.
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Preview</h3>

          <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
            {/* Notification Preview */}
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                isUrgent ? 'bg-red-500' : 'bg-primary-600'
              )}>
                {isUrgent ? (
                  <AlertTriangle className="w-5 h-5 text-white" />
                ) : (
                  <Bell className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">
                    {title || 'Notification Title'}
                  </p>
                  {isUrgent && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {message || 'Notification message will appear here...'}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Just now · Tool Connect
                </p>
              </div>
            </div>
          </div>

          {/* Target Info */}
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
            <h4 className="text-gray-300 text-sm font-medium mb-2">Target Audience</h4>
            <div className="flex items-center gap-2">
              {targetType === 'all' && <Users className="w-5 h-5 text-primary-400" />}
              {targetType === 'clients' && <UserCircle className="w-5 h-5 text-green-400" />}
              {targetType === 'providers' && <Briefcase className="w-5 h-5 text-blue-400" />}
              <span className="text-white capitalize">
                {targetType === 'all' ? 'All Users' : targetType === 'clients' ? 'Clients Only' : 'Service Providers Only'}
              </span>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6">
            <h4 className="text-gray-300 text-sm font-medium mb-3">Tips</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                Keep titles short and attention-grabbing
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                Use urgent flag sparingly for important updates
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                Target specific audiences for relevant content
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                Test with a small group before mass sending
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

