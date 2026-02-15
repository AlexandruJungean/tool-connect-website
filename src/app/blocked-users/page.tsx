'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserX, Trash2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button, LoadingSpinner, EmptyState, ConfirmDialog, Avatar } from '@/components/ui'
import { AlertCard } from '@/components/cards'
import { getBlockedUsers, unblockUser, Block } from '@/lib/api/blocks'
import { supabase } from '@/lib/supabase'

interface BlockedUserDisplay extends Block {
  displayName: string
  avatarUrl?: string
}

export default function BlockedUsersPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { user } = useAuth()

  const [blockedUsers, setBlockedUsers] = useState<BlockedUserDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false)
  const [userToUnblock, setUserToUnblock] = useState<BlockedUserDisplay | null>(null)
  const [isUnblocking, setIsUnblocking] = useState(false)

  const t = {
    title: language === 'cs' ? 'Blokovaní uživatelé' : 'Blocked Users',
    subtitle: language === 'cs' 
      ? 'Spravujte svůj seznam blokovaných uživatelů'
      : 'Manage your blocked users list',
    emptyTitle: language === 'cs' ? 'Žádní blokovaní uživatelé' : 'No Blocked Users',
    emptyDescription: language === 'cs' 
      ? 'Zatím jste nikoho nezablokovali'
      : 'You haven\'t blocked anyone yet',
    unblock: language === 'cs' ? 'Odblokovat' : 'Unblock',
    unblockTitle: language === 'cs' ? 'Odblokovat uživatele' : 'Unblock User',
    unblockMessage: language === 'cs' 
      ? 'Opravdu chcete tohoto uživatele odblokovat? Bude vás moci znovu kontaktovat.'
      : 'Are you sure you want to unblock this user? They will be able to contact you again.',
    cancel: language === 'cs' ? 'Zrušit' : 'Cancel',
    confirm: language === 'cs' ? 'Potvrdit' : 'Confirm',
    blockedOn: language === 'cs' ? 'Zablokováno' : 'Blocked on',
  }

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      if (!user) return

      try {
        const blocks = await getBlockedUsers(user.id)
        
        // Fetch display names for blocked users
        const displayBlocks = await Promise.all(
          blocks.map(async (block) => {
            let displayName = 'Unknown User'
            let avatarUrl: string | undefined

            if (block.blocked_profile_type === 'service_provider') {
              const { data } = await supabase
                .from('service_provider_profiles')
                .select('name, surname, avatar_url')
                .eq('user_id', block.blocked_id)
                .single()
              
              if (data) {
                displayName = `${data.name || ''} ${data.surname || ''}`.trim() || 'Service Provider'
                avatarUrl = data.avatar_url
              }
            } else {
              const { data } = await supabase
                .from('client_profiles')
                .select('name, surname, avatar_url')
                .eq('user_id', block.blocked_id)
                .single()
              
              if (data) {
                displayName = `${data.name || ''} ${data.surname || ''}`.trim() || 'Client'
                avatarUrl = data.avatar_url
              }
            }

            return { ...block, displayName, avatarUrl }
          })
        )

        setBlockedUsers(displayBlocks)
      } catch (err) {
        console.error('Failed to fetch blocked users:', err)
        setError(language === 'cs' 
          ? 'Nepodařilo se načíst blokované uživatele'
          : 'Failed to load blocked users')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlockedUsers()
  }, [user, language])

  const handleUnblock = async () => {
    if (!user || !userToUnblock) return

    setIsUnblocking(true)
    try {
      await unblockUser(user.id, userToUnblock.blocked_id)
      setBlockedUsers(prev => prev.filter(u => u.id !== userToUnblock.id))
      setUnblockDialogOpen(false)
      setUserToUnblock(null)
    } catch (err) {
      console.error('Failed to unblock user:', err)
      setError(language === 'cs' 
        ? 'Nepodařilo se odblokovat uživatele'
        : 'Failed to unblock user')
    } finally {
      setIsUnblocking(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AlertCard
          variant="warning"
          message={language === 'cs' ? 'Přihlaste se prosím' : 'Please log in'}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <AlertCard 
            variant="error" 
            message={error} 
            onDismiss={() => setError(null)} 
            className="mb-4"
          />
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : blockedUsers.length === 0 ? (
          <EmptyState
            icon={UserX}
            title={t.emptyTitle}
            description={t.emptyDescription}
          />
        ) : (
          <div className="space-y-3">
            {blockedUsers.map((blockedUser) => (
              <div
                key={blockedUser.id}
                className="bg-white rounded-2xl shadow-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={blockedUser.avatarUrl}
                    fallbackInitials={blockedUser.displayName[0]}
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{blockedUser.displayName}</p>
                    <p className="text-xs text-gray-500">
                      {t.blockedOn} {new Date(blockedUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUserToUnblock(blockedUser)
                    setUnblockDialogOpen(true)
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {t.unblock}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unblock Confirmation Dialog */}
      <ConfirmDialog
        isOpen={unblockDialogOpen}
        onClose={() => setUnblockDialogOpen(false)}
        onConfirm={handleUnblock}
        title={t.unblockTitle}
        message={t.unblockMessage}
        confirmLabel={t.confirm}
        cancelLabel={t.cancel}
        variant="warning"
        isLoading={isUnblocking}
      />
    </div>
  )
}

