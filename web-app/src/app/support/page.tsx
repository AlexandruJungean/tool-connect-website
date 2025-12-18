'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, HelpCircle, Send, Mail } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, TextArea, LoadingSpinner } from '@/components/ui'
import { AlertCard } from '@/components/cards'
import { createSupportRequest, SUPPORT_EMAIL } from '@/lib/api/support'

export default function SupportPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { user, clientProfile, serviceProviderProfile, currentUserType } = useAuth()

  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const t = {
    title: language === 'cs' ? 'Podpora' : 'Support',
    subtitle: language === 'cs' 
      ? 'Jak vám můžeme pomoci?'
      : 'How can we help you?',
    subjectLabel: language === 'cs' ? 'Předmět' : 'Subject',
    subjectPlaceholder: language === 'cs' 
      ? 'Krátce popište svůj problém'
      : 'Briefly describe your issue',
    descriptionLabel: language === 'cs' ? 'Popis' : 'Description',
    descriptionPlaceholder: language === 'cs' 
      ? 'Popište problém podrobněji...'
      : 'Describe your issue in detail...',
    emailLabel: language === 'cs' ? 'Kontaktní email' : 'Contact Email',
    emailPlaceholder: language === 'cs' ? 'vas@email.cz' : 'your@email.com',
    submit: language === 'cs' ? 'Odeslat' : 'Submit',
    submitting: language === 'cs' ? 'Odesílání...' : 'Submitting...',
    successTitle: language === 'cs' ? 'Zpráva odeslána' : 'Message Sent',
    successMessage: language === 'cs' 
      ? 'Děkujeme za kontaktování. Odpovíme vám co nejdříve.'
      : 'Thank you for contacting us. We will respond as soon as possible.',
    orEmail: language === 'cs' ? 'Nebo nás kontaktujte přímo' : 'Or contact us directly',
    backHome: language === 'cs' ? 'Zpět domů' : 'Back to Home',
    errorSubject: language === 'cs' ? 'Vyplňte předmět' : 'Subject is required',
    errorDescription: language === 'cs' ? 'Vyplňte popis' : 'Description is required',
    errorEmail: language === 'cs' ? 'Vyplňte email' : 'Email is required',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!subject.trim()) {
      setError(t.errorSubject)
      return
    }

    if (!description.trim()) {
      setError(t.errorDescription)
      return
    }

    if (!user && !email.trim()) {
      setError(t.errorEmail)
      return
    }

    setIsSubmitting(true)

    try {
      const profile = currentUserType === 'client' ? clientProfile : serviceProviderProfile
      
      await createSupportRequest({
        userId: user?.id,
        userEmail: email || user?.email || undefined,
        userPhone: user?.phone || undefined,
        userName: profile 
          ? `${profile.name || ''} ${profile.surname || ''}`.trim() 
          : undefined,
        subject: subject.trim(),
        description: description.trim(),
        profileType: user 
          ? (currentUserType as 'client' | 'service_provider') 
          : 'guest',
        appVersion: '1.0.0',
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      })

      setSuccess(true)
    } catch (err) {
      console.error('Failed to submit support request:', err)
      setError(language === 'cs' 
        ? 'Nepodařilo se odeslat zprávu. Zkuste to prosím znovu.'
        : 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Send className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.successTitle}</h2>
        <p className="text-gray-600 text-center mb-6">{t.successMessage}</p>
        <Button onClick={() => router.push('/search')}>{t.backHome}</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
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

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <AlertCard variant="error" message={error} onDismiss={() => setError(null)} />
          )}

          <Input
            label={t.subjectLabel}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t.subjectPlaceholder}
            required
          />

          <TextArea
            label={t.descriptionLabel}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            rows={6}
            required
          />

          {!user && (
            <Input
              label={t.emailLabel}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
            />
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.submitting : t.submit}
          </Button>
        </form>

        {/* Direct contact */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center mb-4">{t.orEmail}</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 transition-colors"
          >
            <Mail className="w-5 h-5 text-primary-600" />
            <span className="text-primary-600 font-medium">{SUPPORT_EMAIL}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

