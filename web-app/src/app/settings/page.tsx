'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { 
  Globe, 
  Bell, 
  Shield, 
  HelpCircle, 
  FileText,
  ChevronRight,
  LogOut,
  Loader2,
  User,
  Pencil,
  Eye,
  EyeOff,
  Phone,
  ArrowLeftRight,
  UserPlus,
  BarChart3,
  MessageSquare,
  Briefcase,
  UserCheck,
  Megaphone,
  Ban,
  Trash2,
  UserMinus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingItemProps {
  icon: React.ReactNode
  label: string
  value?: string
  onClick?: () => void
  href?: string
  external?: boolean
  switchValue?: boolean
  onSwitchChange?: (value: boolean) => void
  danger?: boolean
  showArrow?: boolean
}

function SettingItem({ 
  icon, 
  label, 
  value, 
  onClick, 
  href, 
  external, 
  switchValue, 
  onSwitchChange,
  danger = false,
  showArrow = true
}: SettingItemProps) {
  const content = (
    <div className={cn(
      "flex items-center justify-between p-4 transition-colors",
      onClick || href ? "hover:bg-gray-50 cursor-pointer" : "",
      danger && "hover:bg-red-50"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          danger ? "bg-red-100" : "bg-primary-100"
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <span className={cn(
            "font-medium",
            danger ? "text-red-600" : "text-gray-900"
          )}>{label}</span>
          {value && (
            <p className="text-sm text-gray-500 mt-0.5">{value}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onSwitchChange !== undefined ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSwitchChange(!switchValue)
            }}
            className={cn(
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
              switchValue ? "bg-primary-700" : "bg-gray-200"
            )}
          >
            <span className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out",
              switchValue ? "translate-x-5" : "translate-x-0"
            )} />
          </button>
        ) : showArrow ? (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        ) : null}
      </div>
    </div>
  )

  if (external && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  if (href) {
    return (
      <Link href={href} prefetch={false}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    )
  }

  return content
}

interface SettingSectionProps {
  title: string
  children: React.ReactNode
}

function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 px-1">
        {title}
      </h2>
      <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-100">
        {children}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const { 
    user,
    isAuthenticated, 
    isLoading, 
    clientProfile,
    serviceProviderProfile,
    currentUserType,
    switchUserType,
    signOut,
    refreshProfile
  } = useAuth()

  const [isVisible, setIsVisible] = useState(serviceProviderProfile?.is_visible ?? true)
  const [phoneVisible, setPhoneVisible] = useState(
    currentUserType === 'service_provider' 
      ? (serviceProviderProfile?.phone_visible ?? true)
      : (clientProfile?.phone_visible ?? false)
  )
  const [messageNotifications, setMessageNotifications] = useState(true)
  const [requestNotifications, setRequestNotifications] = useState(true)
  const [marketingNotifications, setMarketingNotifications] = useState(true)

  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [showDeleteProfileDialog, setShowDeleteProfileDialog] = useState(false)
  const [showCreateProfileDialog, setShowCreateProfileDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const isProvider = currentUserType === 'service_provider'
  const hasMultipleProfiles = !!clientProfile && !!serviceProviderProfile

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/platform/login?redirect=/platform/settings'
    }
  }, [isAuthenticated, isLoading])

  // Update local state when profile changes
  useEffect(() => {
    if (serviceProviderProfile) {
      setIsVisible(serviceProviderProfile.is_visible ?? true)
    }
    if (currentUserType === 'service_provider' && serviceProviderProfile) {
      setPhoneVisible(serviceProviderProfile.phone_visible ?? true)
    } else if (clientProfile) {
      setPhoneVisible(clientProfile.phone_visible ?? false)
    }
  }, [serviceProviderProfile, clientProfile, currentUserType])

  // Handle visibility toggle for service providers
  const handleVisibilityToggle = async (value: boolean) => {
    if (!serviceProviderProfile) return
    setIsVisible(value)
    try {
      await supabase
        .from('service_provider_profiles')
        .update({ is_visible: value })
        .eq('id', serviceProviderProfile.id)
      await refreshProfile()
    } catch (error) {
      console.error('Failed to update visibility:', error)
      setIsVisible(!value)
    }
  }

  // Handle phone visibility toggle
  const handlePhoneVisibilityToggle = async (value: boolean) => {
    setPhoneVisible(value)
    try {
      if (currentUserType === 'service_provider' && serviceProviderProfile) {
        await supabase
          .from('service_provider_profiles')
          .update({ phone_visible: value })
          .eq('id', serviceProviderProfile.id)
      } else if (clientProfile) {
        await supabase
          .from('client_profiles')
          .update({ phone_visible: value })
          .eq('id', clientProfile.id)
      }
      await refreshProfile()
    } catch (error) {
      console.error('Failed to update phone visibility:', error)
      setPhoneVisible(!value)
    }
  }

  // Handle switch or create profile
  const handleSwitchOrCreateProfile = () => {
    if (isProvider) {
      if (clientProfile) {
        switchUserType('client')
      } else {
        setShowCreateProfileDialog(true)
      }
    } else {
      if (serviceProviderProfile) {
        switchUserType('service_provider')
      } else {
        setShowCreateProfileDialog(true)
      }
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    setIsProcessing(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Failed to sign out:', error)
    } finally {
      setIsProcessing(false)
      setShowSignOutDialog(false)
    }
  }

  // Handle delete profile
  const handleDeleteProfile = async () => {
    if (!hasMultipleProfiles) return
    
    setIsProcessing(true)
    try {
      if (isProvider && serviceProviderProfile) {
        await supabase
          .from('service_provider_profiles')
          .delete()
          .eq('id', serviceProviderProfile.id)
        switchUserType('client')
      } else if (clientProfile) {
        await supabase
          .from('client_profiles')
          .delete()
          .eq('id', clientProfile.id)
        switchUserType('service_provider')
      }
      await refreshProfile()
    } catch (error) {
      console.error('Failed to delete profile:', error)
    } finally {
      setIsProcessing(false)
      setShowDeleteProfileDialog(false)
    }
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!user) return
    
    setIsProcessing(true)
    try {
      // Delete all profiles first
      if (clientProfile) {
        await supabase.from('client_profiles').delete().eq('id', clientProfile.id)
      }
      if (serviceProviderProfile) {
        await supabase.from('service_provider_profiles').delete().eq('id', serviceProviderProfile.id)
      }
      // Delete user account
      await supabase.rpc('delete_user_account', { user_id: user.id })
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Failed to delete account:', error)
    } finally {
      setIsProcessing(false)
      setShowDeleteAccountDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const currentProfile = isProvider ? serviceProviderProfile : clientProfile

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('nav.settings')}</h1>

        {/* Profile Card */}
        <Link 
          href={isProvider ? `/providers/${serviceProviderProfile?.id}` : `/clients/${clientProfile?.id}`}
          prefetch={false}
          className="block mb-6"
        >
          <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {currentProfile?.avatar_url ? (
                <img 
                  src={currentProfile.avatar_url} 
                  alt={currentProfile.name || ''} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary-700" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {currentProfile?.name} {(currentProfile as any)?.surname}
              </p>
              <p className="text-sm text-gray-500">
                {isProvider 
                  ? (language === 'cs' ? 'Poskytovatel služeb' : 'Service Provider')
                  : (language === 'cs' ? 'Klient' : 'Client')
                }
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>

        {/* Profile Management */}
        <SettingSection title={language === 'cs' ? 'Správa profilu' : 'Profile Management'}>
          {/* Switch/Create Profile */}
          <SettingItem
            icon={isProvider 
              ? (clientProfile ? <ArrowLeftRight className="w-5 h-5 text-primary-700" /> : <UserPlus className="w-5 h-5 text-primary-700" />)
              : (serviceProviderProfile ? <ArrowLeftRight className="w-5 h-5 text-primary-700" /> : <UserPlus className="w-5 h-5 text-primary-700" />)
            }
            label={isProvider
              ? (clientProfile 
                  ? (language === 'cs' ? 'Přepnout na klienta' : 'Switch to Client')
                  : (language === 'cs' ? 'Vytvořit profil klienta' : 'Create Client Profile'))
              : (serviceProviderProfile
                  ? (language === 'cs' ? 'Přepnout na poskytovatele' : 'Switch to Provider')
                  : (language === 'cs' ? 'Vytvořit profil poskytovatele' : 'Create Provider Profile'))
            }
            onClick={handleSwitchOrCreateProfile}
          />

          {/* Edit Profile */}
          <SettingItem
            icon={<Pencil className="w-5 h-5 text-primary-700" />}
            label={language === 'cs' ? 'Upravit profil' : 'Edit Profile'}
            href="/profile/edit"
          />

          {/* Statistics - SP only */}
          {isProvider && (
            <SettingItem
              icon={<BarChart3 className="w-5 h-5 text-primary-700" />}
              label={language === 'cs' ? 'Statistiky' : 'Statistics'}
              href="/statistics"
            />
          )}

          {/* Visibility - SP only */}
          {isProvider && serviceProviderProfile && (
            <SettingItem
              icon={isVisible 
                ? <Eye className="w-5 h-5 text-primary-700" /> 
                : <EyeOff className="w-5 h-5 text-primary-700" />
              }
              label={language === 'cs' ? 'Viditelnost profilu' : 'Profile Visibility'}
              value={isVisible 
                ? (language === 'cs' ? 'Viditelný' : 'Visible')
                : (language === 'cs' ? 'Skrytý' : 'Hidden')
              }
              switchValue={isVisible}
              onSwitchChange={handleVisibilityToggle}
            />
          )}

          {/* Phone Visibility */}
          <SettingItem
            icon={<Phone className="w-5 h-5 text-primary-700" />}
            label={language === 'cs' ? 'Viditelnost tel. čísla' : 'Phone Number Visibility'}
            value={phoneVisible 
              ? (isProvider 
                  ? (language === 'cs' ? 'Viditelné pro klienty' : 'Visible to clients')
                  : (language === 'cs' ? 'Viditelné pro poskytovatele' : 'Visible to providers'))
              : (isProvider
                  ? (language === 'cs' ? 'Skryté před klienty' : 'Hidden from clients')
                  : (language === 'cs' ? 'Skryté před poskytovateli' : 'Hidden from providers'))
            }
            switchValue={phoneVisible}
            onSwitchChange={handlePhoneVisibilityToggle}
          />
        </SettingSection>

        {/* Preferences */}
        <SettingSection title={language === 'cs' ? 'Předvolby' : 'Preferences'}>
          <SettingItem
            icon={<Globe className="w-5 h-5 text-primary-700" />}
            label={language === 'cs' ? 'Jazyk' : 'Language'}
            value={language === 'cs' ? 'Čeština' : 'English'}
            onClick={() => setLanguage(language === 'cs' ? 'en' : 'cs')}
          />
        </SettingSection>

        {/* Notifications */}
        <SettingSection title={language === 'cs' ? 'Notifikace' : 'Notifications'}>
          <SettingItem
            icon={<MessageSquare className="w-5 h-5 text-primary-700" />}
            label={language === 'cs' ? 'Notifikace zpráv' : 'Message Notifications'}
            value={language === 'cs' ? 'Upozornění na nové zprávy' : 'Get notified for new messages'}
            switchValue={messageNotifications}
            onSwitchChange={setMessageNotifications}
          />
          <SettingItem
            icon={isProvider 
              ? <Briefcase className="w-5 h-5 text-primary-700" />
              : <UserCheck className="w-5 h-5 text-primary-700" />
            }
            label={isProvider
              ? (language === 'cs' ? 'Nové poptávky' : 'New Work Requests')
              : (language === 'cs' ? 'Nové přihlášky' : 'New Applications')
            }
            value={isProvider
              ? (language === 'cs' ? 'Upozornění na nové poptávky' : 'Get notified for new requests')
              : (language === 'cs' ? 'Upozornění na nové přihlášky' : 'Get notified for new applications')
            }
            switchValue={requestNotifications}
            onSwitchChange={setRequestNotifications}
          />
          <SettingItem
            icon={<Megaphone className="w-5 h-5 text-primary-700" />}
            label={language === 'cs' ? 'Informativní notifikace' : 'Informative Notifications'}
            value={language === 'cs' ? 'Novinky a tipy' : 'News and tips'}
            switchValue={marketingNotifications}
            onSwitchChange={setMarketingNotifications}
          />
        </SettingSection>

        {/* Privacy & Security */}
        <SettingSection title={language === 'cs' ? 'Soukromí a zabezpečení' : 'Privacy & Security'}>
          <SettingItem
            icon={<Ban className="w-5 h-5 text-primary-700" />}
            label={isProvider
              ? (language === 'cs' ? 'Blokovaní uživatelé' : 'Blocked Users')
              : (language === 'cs' ? 'Blokovaní poskytovatelé' : 'Blocked Providers')
            }
            href="/settings/blocked"
          />
        </SettingSection>

        {/* Support */}
        <SettingSection title={language === 'cs' ? 'Podpora' : 'Support'}>
          <SettingItem
            icon={<HelpCircle className="w-5 h-5 text-primary-700" />}
            label={language === 'cs' ? 'Nápověda a podpora' : 'Help and Support'}
            href="mailto:info@tool-connect.com"
            external
          />
          <SettingItem
            icon={<FileText className="w-5 h-5 text-primary-700" />}
            label={language === 'cs' ? 'Podmínky služby' : 'Terms and Conditions'}
            href="/terms-conditions.html"
            external
          />
          <SettingItem
            icon={<Shield className="w-5 h-5 text-primary-700" />}
            label={language === 'cs' ? 'Zásady ochrany osobních údajů' : 'Privacy Policy'}
            href="/privacy-policy.html"
            external
          />
        </SettingSection>

        {/* Account */}
        <SettingSection title={language === 'cs' ? 'Účet' : 'Account'}>
          <SettingItem
            icon={<LogOut className="w-5 h-5 text-primary-700" />}
            label={language === 'cs' ? 'Odhlásit se' : 'Sign Out'}
            onClick={() => setShowSignOutDialog(true)}
            showArrow={false}
          />
          {hasMultipleProfiles && (
            <SettingItem
              icon={<UserMinus className="w-5 h-5 text-red-600" />}
              label={isProvider
                ? (language === 'cs' ? 'Smazat profil poskytovatele' : 'Delete Provider Profile')
                : (language === 'cs' ? 'Smazat profil klienta' : 'Delete Client Profile')
              }
              onClick={() => setShowDeleteProfileDialog(true)}
              danger
              showArrow={false}
            />
          )}
          <SettingItem
            icon={<Trash2 className="w-5 h-5 text-red-600" />}
            label={language === 'cs' ? 'Smazat účet' : 'Delete Account'}
            onClick={() => setShowDeleteAccountDialog(true)}
            danger
            showArrow={false}
          />
        </SettingSection>

        {/* App Version */}
        <p className="text-center text-sm text-gray-400 mt-8">
          Tool Connect Web v1.0.0
        </p>
      </div>

      {/* Sign Out Dialog */}
      <ConfirmationDialog
        isOpen={showSignOutDialog}
        title={language === 'cs' ? 'Odhlásit se' : 'Sign Out'}
        message={language === 'cs' 
          ? 'Opravdu se chcete odhlásit?' 
          : 'Are you sure you want to sign out?'
        }
        confirmText={language === 'cs' ? 'Odhlásit' : 'Sign Out'}
        cancelText={language === 'cs' ? 'Zrušit' : 'Cancel'}
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutDialog(false)}
        isLoading={isProcessing}
      />

      {/* Delete Profile Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteProfileDialog}
        title={isProvider
          ? (language === 'cs' ? 'Smazat profil poskytovatele' : 'Delete Provider Profile')
          : (language === 'cs' ? 'Smazat profil klienta' : 'Delete Client Profile')
        }
        message={isProvider
          ? (language === 'cs' 
              ? 'Opravdu chcete smazat svůj profil poskytovatele? Tato akce je nevratná.'
              : 'Are you sure you want to delete your provider profile? This action cannot be undone.')
          : (language === 'cs'
              ? 'Opravdu chcete smazat svůj profil klienta? Tato akce je nevratná.'
              : 'Are you sure you want to delete your client profile? This action cannot be undone.')
        }
        confirmText={language === 'cs' ? 'Smazat' : 'Delete'}
        cancelText={language === 'cs' ? 'Zrušit' : 'Cancel'}
        onConfirm={handleDeleteProfile}
        onCancel={() => setShowDeleteProfileDialog(false)}
        variant="danger"
        isLoading={isProcessing}
      />

      {/* Delete Account Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteAccountDialog}
        title={language === 'cs' ? 'Smazat účet' : 'Delete Account'}
        message={language === 'cs' 
          ? 'Opravdu chcete smazat svůj účet? Všechna data budou trvale odstraněna. Tato akce je nevratná.'
          : 'Are you sure you want to delete your account? All data will be permanently deleted. This action cannot be undone.'
        }
        confirmText={language === 'cs' ? 'Smazat účet' : 'Delete Account'}
        cancelText={language === 'cs' ? 'Zrušit' : 'Cancel'}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteAccountDialog(false)}
        variant="danger"
        isLoading={isProcessing}
      />

      {/* Create Profile Dialog */}
      <ConfirmationDialog
        isOpen={showCreateProfileDialog}
        title={language === 'cs' ? 'Vytvořit profil' : 'Create Profile'}
        message={isProvider
          ? (language === 'cs' 
              ? 'Chcete vytvořit profil klienta? Budete moci procházet a kontaktovat poskytovatele služeb.'
              : 'Would you like to create a client profile? You will be able to browse and contact service providers.')
          : (language === 'cs'
              ? 'Chcete vytvořit profil poskytovatele služeb? Budete moci nabízet své služby klientům.'
              : 'Would you like to create a service provider profile? You will be able to offer your services to clients.')
        }
        confirmText={language === 'cs' ? 'Vytvořit' : 'Create'}
        cancelText={language === 'cs' ? 'Zrušit' : 'Cancel'}
        onConfirm={() => {
          setShowCreateProfileDialog(false)
          if (isProvider) {
            router.push('/onboarding/client')
          } else {
            router.push('/onboarding/service-provider')
          }
        }}
        onCancel={() => setShowCreateProfileDialog(false)}
      />
    </div>
  )
}
