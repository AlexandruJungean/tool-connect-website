'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, TextArea, LoadingSpinner } from '@/components/ui'
import { ImageUpload } from '@/components/forms'
import { AlertCard } from '@/components/cards'
import { supabase } from '@/lib/supabase'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditPortfolioProjectPage({ params }: Props) {
  const { id: projectId } = use(params)
  const router = useRouter()
  const { language } = useLanguage()
  const { serviceProviderProfile } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = {
    title: language === 'cs' ? 'Upravit projekt' : 'Edit Project',
    projectTitle: language === 'cs' ? 'Název projektu' : 'Project Title',
    titlePlaceholder: language === 'cs' ? 'Např. Rekonstrukce koupelny' : 'E.g. Bathroom Renovation',
    description: language === 'cs' ? 'Popis (volitelné)' : 'Description (optional)',
    descriptionPlaceholder: language === 'cs' 
      ? 'Popište tento projekt...'
      : 'Describe this project...',
    image: language === 'cs' ? 'Obrázek projektu' : 'Project Image',
    save: language === 'cs' ? 'Uložit změny' : 'Save Changes',
    saving: language === 'cs' ? 'Ukládání...' : 'Saving...',
    errorTitle: language === 'cs' ? 'Vyplňte název projektu' : 'Please enter a project title',
    errorNotFound: language === 'cs' ? 'Projekt nenalezen' : 'Project not found',
    errorNotOwner: language === 'cs' 
      ? 'Nemáte oprávnění upravovat tento projekt'
      : 'You don\'t have permission to edit this project',
  }

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('id', projectId)
          .single()

        if (error) throw error

        if (!data) {
          setError(t.errorNotFound)
          return
        }

        if (data.service_provider_id !== serviceProviderProfile?.id) {
          setError(t.errorNotOwner)
          return
        }

        setTitle(data.title || '')
        setDescription(data.description || '')
        setImageUrl(data.image_url || null)
      } catch (err) {
        console.error('Failed to fetch project:', err)
        setError(language === 'cs' 
          ? 'Nepodařilo se načíst projekt'
          : 'Failed to load project')
      } finally {
        setIsLoading(false)
      }
    }

    if (serviceProviderProfile) {
      fetchProject()
    } else {
      setIsLoading(false)
    }
  }, [projectId, serviceProviderProfile, language, t.errorNotFound, t.errorNotOwner])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError(t.errorTitle)
      return
    }

    setIsSubmitting(true)

    try {
      const { error: updateError } = await supabase
        .from('portfolio_projects')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)

      if (updateError) throw updateError

      router.push('/portfolio')
    } catch (err) {
      console.error('Failed to update project:', err)
      setError(language === 'cs' 
        ? 'Nepodařilo se aktualizovat projekt. Zkuste to prosím znovu.'
        : 'Failed to update project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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

