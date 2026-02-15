'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { supabase } from '@/lib/supabase'
import { Message } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui'
import { formatTimeAgo } from '@/lib/utils'
import { 
  MessageSquare, 
  Send, 
  ArrowLeft,
  User,
  Search,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewType = 'client' | 'provider'

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, t } = useLanguage()
  const { isAuthenticated, isLoading: authLoading, user, clientProfile, serviceProviderProfile, currentUserType } = useAuth()
  const { clientUnreadCount, providerUnreadCount, refreshUnreadCounts } = useNotifications()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  
  // File attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // For new conversations (when no existing conversation exists)
  const [newConversationProvider, setNewConversationProvider] = useState<any>(null)

  // Check if user has both profiles
  const hasBothProfiles = !!clientProfile && !!serviceProviderProfile
  
  // Active view type for messages
  const [activeView, setActiveView] = useState<ViewType>(
    currentUserType === 'service_provider' ? 'provider' : 'client'
  )

  // Determine which profile to use based on active view
  const effectiveUserType = hasBothProfiles ? activeView : (currentUserType === 'service_provider' ? 'provider' : 'client')
  const profileId = effectiveUserType === 'client' ? clientProfile?.id : serviceProviderProfile?.id

  // Redirect if not authenticated (only after auth loading is complete)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login?redirect=/messages'
    }
  }, [isAuthenticated, authLoading])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user || !profileId) return
      
      setIsLoading(true)
      try {
        let query = supabase
          .from('conversations')
          .select(`
            *,
            client:client_profiles(id, name, surname, avatar_url),
            service_provider:service_provider_profiles(id, name, surname, avatar_url),
            last_message:messages(id, message_text, created_at, is_read, sender_id, attachment_url, attachment_type)
          `)
          .order('last_message_at', { ascending: false })

        if (effectiveUserType === 'provider') {
          query = query.eq('service_provider_id', profileId)
        } else {
          query = query.eq('client_id', profileId)
        }

        const { data, error } = await query

        if (error) throw error
        
        // Process conversations to get the last message properly
        const processedData = (data || []).map((conv: any) => ({
          ...conv,
          last_message: Array.isArray(conv.last_message) 
            ? conv.last_message.sort((a: any, b: any) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0] 
            : conv.last_message
        }))
        
        setConversations(processedData)

        // Get unread counts for each conversation
        const counts: Record<string, number> = {}
        for (const convo of processedData) {
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', convo.id)
            .eq('is_read', false)
            .neq('sender_id', user.id)
          
          counts[convo.id] = count || 0
        }
        setUnreadCounts(counts)

        // Auto-select first conversation or from URL param
        const providerId = searchParams.get('provider')
        if (providerId && effectiveUserType === 'client') {
          // Find existing conversation with this provider
          const existing = processedData.find((c: any) => c.service_provider_id === providerId)
          if (existing) {
            setSelectedConversation(existing.id)
            setNewConversationProvider(null)
          } else {
            // No existing conversation - fetch provider info for new conversation
            const { data: providerData } = await supabase
              .from('service_provider_profiles')
              .select('id, name, surname, avatar_url')
              .eq('id', providerId)
              .single()
            
            if (providerData) {
              setNewConversationProvider(providerData)
              setSelectedConversation(null)
            }
          }
        } else if (processedData.length > 0 && !selectedConversation) {
          setSelectedConversation(processedData[0].id)
        }
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [user, profileId, effectiveUserType, searchParams])

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !user) return

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        return
      }

      setMessages(data || [])

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', selectedConversation)
        .neq('sender_id', user.id)
        .eq('is_read', false)

      // Update local unread count
      setUnreadCounts(prev => ({ ...prev, [selectedConversation]: 0 }))
      
      // Refresh global unread counts
      refreshUnreadCounts()
    }

    fetchMessages()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => [...prev, newMsg])
          
          // If message is from other user, mark as read immediately
          if (newMsg.sender_id !== user?.id) {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [selectedConversation, user, refreshUnreadCounts])

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Upload file to Supabase storage
  const uploadFile = async (file: File): Promise<{ url: string; type: string; name: string } | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `chat-attachments/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      name: file.name
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || !user) return
    
    // Need either an existing conversation OR a new conversation provider
    if (!selectedConversation && !newConversationProvider) return
    if (!clientProfile && effectiveUserType === 'client') return

    setIsSending(true)
    setIsUploading(!!selectedFile)
    
    try {
      let conversationId = selectedConversation
      
      // If this is a new conversation, create it first
      if (!conversationId && newConversationProvider && clientProfile) {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            client_id: clientProfile.id,
            service_provider_id: newConversationProvider.id,
          })
          .select()
          .single()
        
        if (convError) throw convError
        conversationId = newConv.id
        
        // Add the new conversation to the list
        const newConvWithDetails = {
          ...newConv,
          service_provider: newConversationProvider,
          client: clientProfile,
        }
        setConversations(prev => [newConvWithDetails, ...prev])
        setSelectedConversation(conversationId)
        setNewConversationProvider(null)
      }
      
      if (!conversationId) return

      // Upload file if selected
      let attachmentData: { url: string; type: string; name: string } | null = null
      if (selectedFile) {
        attachmentData = await uploadFile(selectedFile)
        if (!attachmentData) {
          throw new Error('Failed to upload file')
        }
      }

      const messageText = newMessage.trim() || (attachmentData?.type === 'file' ? attachmentData.name : '')
      const { data: sentMessage, error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message_text: messageText,
        attachment_url: attachmentData?.url || null,
        attachment_type: attachmentData?.type || null,
        attachment_name: attachmentData?.name || null,
      }).select().single()

      if (error) throw error
      
      // Add the message to local state immediately
      if (sentMessage) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === sentMessage.id)
          if (exists) return prev
          return [...prev, sentMessage as Message]
        })
      }
      
      setNewMessage('')
      clearSelectedFile()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
      setIsUploading(false)
    }
  }

  // Handle tab switch
  const handleTabSwitch = (view: ViewType) => {
    if (view !== activeView) {
      setActiveView(view)
      setIsLoading(true)
      setConversations([])
      setSelectedConversation(null)
      setNewConversationProvider(null)
      setSearchQuery('')
    }
  }

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const other = effectiveUserType === 'provider' ? conv.client : conv.service_provider
    return (
      other?.name?.toLowerCase().includes(query) ||
      other?.surname?.toLowerCase().includes(query)
    )
  })

  const selectedConv = conversations.find((c) => c.id === selectedConversation)
  const otherUser = newConversationProvider 
    ? newConversationProvider 
    : (effectiveUserType === 'provider'
        ? selectedConv?.client
        : selectedConv?.service_provider)
  
  // Determine if we can show the chat area
  const canShowChat = selectedConversation || newConversationProvider

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)]">
        <div className="flex h-full bg-white shadow-card rounded-none md:rounded-2xl md:my-4 overflow-hidden">
          {/* Conversations List */}
          <div className={cn(
            "w-full md:w-80 border-r border-gray-100 flex flex-col",
            selectedConversation ? "hidden md:flex" : "flex"
          )}>
            <div className="p-4 border-b border-gray-100">
              <h1 className="text-xl font-bold text-gray-900">{t('messages.title')}</h1>
            </div>

            {/* Profile Switcher Tabs - only show if user has both profiles */}
            {hasBothProfiles && (
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => handleTabSwitch('client')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeView === 'client'
                      ? "text-primary-700 border-primary-700"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  )}
                >
                  <span>{language === 'cs' ? 'Jako klient' : 'As Client'}</span>
                  {clientUnreadCount > 0 && (
                    <span className={cn(
                      "min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold rounded-full",
                      activeView === 'client'
                        ? "bg-primary-700 text-white"
                        : "bg-gray-300 text-white"
                    )}>
                      {clientUnreadCount > 99 ? '99+' : clientUnreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleTabSwitch('provider')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeView === 'provider'
                      ? "text-primary-700 border-primary-700"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  )}
                >
                  <span>{language === 'cs' ? 'Jako poskytovatel' : 'As Provider'}</span>
                  {providerUnreadCount > 0 && (
                    <span className={cn(
                      "min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold rounded-full",
                      activeView === 'provider'
                        ? "bg-primary-700 text-white"
                        : "bg-gray-300 text-white"
                    )}>
                      {providerUnreadCount > 99 ? '99+' : providerUnreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Search Bar */}
            {conversations.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={language === 'cs' ? 'Hledat konverzace...' : 'Search conversations...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => {
                  const other = effectiveUserType === 'provider' ? conv.client : conv.service_provider
                  const unreadCount = unreadCounts[conv.id] || 0
                  const lastMessage = conv.last_message
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={cn(
                        "w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50",
                        selectedConversation === conv.id && "bg-primary-50"
                      )}
                    >
                      <div className="relative w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {other?.avatar_url ? (
                          <img src={other.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-primary-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "font-medium truncate",
                            unreadCount > 0 ? "text-gray-900" : "text-gray-700"
                          )}>
                            {other?.name} {other?.surname}
                          </p>
                          {unreadCount > 0 && (
                            <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 truncate">
                          {lastMessage?.attachment_url && (
                            <>
                              {lastMessage.attachment_type === 'image' ? (
                                <ImageIcon className="w-3 h-3 flex-shrink-0" />
                              ) : (
                                <FileText className="w-3 h-3 flex-shrink-0" />
                              )}
                            </>
                          )}
                          <span className="truncate">
                            {lastMessage?.message_text || (lastMessage?.attachment_url ? (language === 'cs' ? 'Příloha' : 'Attachment') : '')}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span className="flex-shrink-0">{formatTimeAgo(conv.last_message_at, language)}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : conversations.length > 0 && searchQuery ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {language === 'cs' ? 'Žádné výsledky' : 'No results found'}
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">{t('messages.noConversations')}</p>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col",
            !canShowChat ? "hidden md:flex" : "flex"
          )}>
            {canShowChat && otherUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedConversation(null)
                      setNewConversationProvider(null)
                    }}
                    className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {/* Clickable profile link */}
                  <button
                    onClick={() => {
                      // Navigate to the other user's profile
                      const profileUrl = effectiveUserType === 'provider'
                        ? `/clients/${otherUser?.id}`
                        : `/providers/${otherUser?.id}`
                      router.push(profileUrl)
                    }}
                    className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      {otherUser?.avatar_url ? (
                        <img src={otherUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-primary-700" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {otherUser?.name} {otherUser?.surname}
                      </p>
                      <p className="text-xs text-primary-600">
                        {language === 'cs' ? 'Zobrazit profil' : 'View profile'}
                      </p>
                    </div>
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Start-of-conversation placeholder */}
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                        {otherUser?.avatar_url ? (
                          <img src={otherUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-primary-700" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {otherUser?.name} {otherUser?.surname}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {language === 'cs'
                          ? 'Napište zprávu pro zahájení konverzace'
                          : 'Send a message to start the conversation'
                        }
                      </p>

                      <div className="mt-6 max-w-md rounded-xl border border-gray-200 px-4 py-3 text-left">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">
                            {language === 'cs' ? 'Tip:' : 'Tip:'}
                          </span>{' '}
                          {language === 'cs'
                            ? 'Platby si domlouváte přímo mezi sebou, ne přes aplikaci.'
                            : 'Payments are arranged directly between each other, not through the app.'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  {messages.map((message) => {
                    const isMe = message.sender_id === user?.id
                    const hasImage = message.attachment_type === 'image' && message.attachment_url
                    const hasFile = message.attachment_type === 'file' && message.attachment_url
                    
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isMe ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl overflow-hidden",
                            isMe
                              ? "bg-primary-700 text-white rounded-br-md"
                              : "bg-gray-100 text-gray-900 rounded-bl-md"
                          )}
                        >
                          {/* Image attachment */}
                          {hasImage && (
                            <a 
                              href={message.attachment_url!} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img 
                                src={message.attachment_url!} 
                                alt="Attachment" 
                                className="max-w-full max-h-64 object-contain"
                              />
                            </a>
                          )}
                          
                          {/* File attachment */}
                          {hasFile && (
                            <a
                              href={message.attachment_url!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex items-center gap-2 px-4 py-2",
                                isMe ? "hover:bg-primary-800" : "hover:bg-gray-200"
                              )}
                            >
                              <FileText className="w-5 h-5 flex-shrink-0" />
                              <span className="truncate">{message.attachment_name || 'File'}</span>
                              <Download className="w-4 h-4 flex-shrink-0" />
                            </a>
                          )}
                          
                          {/* Message text */}
                          {message.message_text && (
                            <div className="px-4 py-2.5">
                              <p className="whitespace-pre-wrap">{message.message_text}</p>
                            </div>
                          )}
                          
                          <p className={cn(
                            "text-xs px-4 pb-2",
                            isMe ? "text-primary-200" : "text-gray-500"
                          )}>
                            {formatTimeAgo(message.created_at, language)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* File Preview */}
                {selectedFile && (
                  <div className="px-4 py-2 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={clearSelectedFile}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
                  <div className="flex items-end gap-3">
                    {/* Attachment button */}
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        disabled={isUploading}
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <Input
                      placeholder={t('messages.typeMessage')}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      isLoading={isSending}
                      disabled={(!newMessage.trim() && !selectedFile) || isUploading}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {language === 'cs' ? 'Vyberte konverzaci' : 'Select a conversation'}
                </h3>
                <p className="text-gray-500">
                  {language === 'cs' 
                    ? 'Vyberte konverzaci vlevo pro zahájení chatu'
                    : 'Choose a conversation from the left to start chatting'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}
