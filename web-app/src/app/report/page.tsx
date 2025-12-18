'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Flag } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button, TextArea, LoadingSpinner } from '@/components/ui'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { AlertCard } from '@/components/cards'
import { createReport } from '@/lib/api/blocks'
import { REPORT_REASONS, getReportReasonLabel } from '@/constants/optionSets'

function ReportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const { user } = useAuth()

  const providerId = searchParams.get('providerId')

  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const t = {
    title: language === 'cs' ? 'Nahlásit uživatele' : 'Report User',
    subtitle: language === 'cs' 
      ? 'Pomozte nám udržet komunitu bezpečnou'
      : 'Help us keep the community safe',
    reasonLabel: language === 'cs' ? 'Důvod nahlášení' : 'Reason for report',
    detailsLabel: language === 'cs' ? 'Další podrobnosti (volitelné)' : 'Additional details (optional)',
    detailsPlaceholder: language === 'cs' 
      ? 'Poskytněte další informace o problému...'
      : 'Provide more information about the issue...',
    submit: language === 'cs' ? 'Odeslat nahlášení' : 'Submit Report',
    submitting: language === 'cs' ? 'Odesílání...' : 'Submitting...',
    successTitle: language === 'cs' ? 'Nahlášení odesláno' : 'Report Submitted',
    successMessage: language === 'cs' 
      ? 'Děkujeme za nahlášení. Náš tým to prošetří.'
      : 'Thank you for your report. Our team will investigate.',
    errorNoReason: language === 'cs' 
      ? 'Prosím vyberte důvod nahlášení'
      : 'Please select a reason for the report',
    errorNotLoggedIn: language === 'cs' 
      ? 'Pro nahlášení se musíte přihlásit'
      : 'You must be logged in to report',
    backHome: language === 'cs' ? 'Zpět domů' : 'Back to Home',
  }

  const reasonOptions = REPORT_REASONS.map((r) => ({
    value: r.value,
    label: getReportReasonLabel(r.value, language as 'en' | 'cs'),
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      setError(t.errorNotLoggedIn)
      return
    }

    if (!reason) {
      setError(t.errorNoReason)
      return
    }

    if (!providerId) {
      setError('Missing provider ID')
      return
    }

    setIsSubmitting(true)

    try {
      await createReport(user.id, providerId, reason, details || undefined)
      setSuccess(true)
    } catch (err) {
      console.error('Failed to submit report:', err)
      setError(language === 'cs' 
        ? 'Nepodařilo se odeslat nahlášení. Zkuste to prosím znovu.'
        : 'Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Flag className="w-8 h-8 text-green-600" />
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

          <RadioGroup
            name="reason"
            label={t.reasonLabel}
            options={reasonOptions}
            value={reason}
            onChange={setReason}
          />

          <TextArea
            label={t.detailsLabel}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t.detailsPlaceholder}
            rows={4}
            maxLength={500}
          />

          <Button
            type="submit"
            className="w-full"
            variant="danger"
            disabled={isSubmitting || !reason}
          >
            {isSubmitting ? t.submitting : t.submit}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <ReportContent />
    </Suspense>
  )
}

