'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, TextArea, LoadingSpinner } from '@/components/ui'
import { ImageUpload } from '@/components/forms'
import { AlertCard } from '@/components/cards'
import { supabase } from '@/lib/supabase'

export default function CreatePortfolioProjectPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { serviceProviderProfile } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = {
    title: language === 'cs' ? 'Přidat projekt' : 'Add Project',
    projectTitle: language === 'cs' ? 'Název projektu' : 'Project Title',
    titlePlaceholder: language === 'cs' ? 'Např. Rekonstrukce koupelny' : 'E.g. Bathroom Renovation',
    description: language === 'cs' ? 'Popis (volitelné)' : 'Description (optional)',
    descriptionPlaceholder: language === 'cs' 
      ? 'Popište tento projekt...'
      : 'Describe this project...',
    image: language === 'cs' ? 'Obrázek projektu' : 'Project Image',
    save: language === 'cs' ? 'Uložit' : 'Save',
    saving: language === 'cs' ? 'Ukládání...' : 'Saving...',
    errorTitle: language === 'cs' ? 'Vyplňte název projektu' : 'Please enter a project title',
    errorImage: language === 'cs' ? 'Nahrajte obrázek projektu' : 'Please upload a project image',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError(t.errorTitle)
      return
    }

    if (!imageUrl) {
      setError(t.errorImage)
      return
    }

    if (!serviceProviderProfile) return

    setIsSubmitting(true)

    try {
      // Get current max order index
      const { data: existingProjects } = await supabase
        .from('portfolio_projects')
        .select('order_index')
        .eq('service_provider_id', serviceProviderProfile.id)
        .order('order_index', { ascending: false })
        .limit(1)

      const maxOrderIndex = existingProjects?.[0]?.order_index ?? -1

      const { error: insertError } = await supabase
        .from('portfolio_projects')
        .insert({
          service_provider_id: serviceProviderProfile.id,
          title: title.trim(),
          description: description.trim() || null,
          image_url: imageUrl,
          order_index: maxOrderIndex + 1,
        })

      if (insertError) throw insertError

      router.push('/portfolio')
    } catch (err) {
      console.error('Failed to create project:', err)
      setError(language === 'cs' 
        ? 'Nepodařilo se vytvořit projekt. Zkuste to prosím znovu.'
        : 'Failed to create project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
          <h1 className="text-lg font-semibold">{t.title}</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <AlertCard variant="error" message={error} onDismiss={() => setError(null)} />
          )}

          <ImageUpload
            label={t.image}
            value={imageUrl}
            onChange={setImageUrl}
            bucket="portfolio"
            aspectRatio="video"
          />

          <Input
            label={t.projectTitle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.titlePlaceholder}
            required
          />

          <TextArea
            label={t.description}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            rows={4}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.saving : t.save}
          </Button>
        </form>
      </div>
    </div>
  )
}

