'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, ImageIcon } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button, LoadingSpinner, EmptyState, ConfirmDialog } from '@/components/ui'
import { AlertCard } from '@/components/cards'
import { supabase } from '@/lib/supabase'

interface PortfolioProject {
  id: string
  title: string
  description?: string
  image_url?: string
  created_at: string
  order_index: number
}

export default function PortfolioPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { serviceProviderProfile } = useAuth()

  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<PortfolioProject | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const t = {
    title: language === 'cs' ? 'Portfolio' : 'Portfolio',
    subtitle: language === 'cs' 
      ? 'Prezentujte svou práci'
      : 'Showcase your work',
    addProject: language === 'cs' ? 'Přidat projekt' : 'Add Project',
    emptyTitle: language === 'cs' ? 'Žádné projekty' : 'No Projects Yet',
    emptyDescription: language === 'cs' 
      ? 'Přidejte projekty, abyste ukázali svou práci potenciálním klientům'
      : 'Add projects to showcase your work to potential clients',
    deleteTitle: language === 'cs' ? 'Smazat projekt' : 'Delete Project',
    deleteMessage: language === 'cs' 
      ? 'Opravdu chcete smazat tento projekt? Tuto akci nelze vrátit.'
      : 'Are you sure you want to delete this project? This action cannot be undone.',
    cancel: language === 'cs' ? 'Zrušit' : 'Cancel',
    delete: language === 'cs' ? 'Smazat' : 'Delete',
    noProviderProfile: language === 'cs' 
      ? 'Pro správu portfolia potřebujete profil poskytovatele'
      : 'You need a provider profile to manage your portfolio',
  }

  useEffect(() => {
    const fetchProjects = async () => {
      if (!serviceProviderProfile) return

      try {
        const { data, error } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('service_provider_id', serviceProviderProfile.id)
          .order('order_index', { ascending: true })

        if (error) throw error
        setProjects((data || []) as PortfolioProject[])
      } catch (err) {
        console.error('Failed to fetch portfolio:', err)
        setError(language === 'cs' 
          ? 'Nepodařilo se načíst portfolio'
          : 'Failed to load portfolio')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [serviceProviderProfile, language])

  const handleDelete = async () => {
    if (!projectToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', projectToDelete.id)

      if (error) throw error

      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id))
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    } catch (err) {
      console.error('Failed to delete project:', err)
      setError(language === 'cs' 
        ? 'Nepodařilo se smazat projekt'
        : 'Failed to delete project')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!serviceProviderProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <AlertCard variant="info" message={t.noProviderProfile} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          <Button onClick={() => router.push('/portfolio/create')}>
            <Plus className="w-4 h-4 mr-2" />
            {t.addProject}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <AlertCard variant="error" message={error} onDismiss={() => setError(null)} className="mb-4" />
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title={t.emptyTitle}
            description={t.emptyDescription}
            actionLabel={t.addProject}
            onAction={() => router.push('/portfolio/create')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-card overflow-hidden group"
              >
                {/* Image */}
                <div className="aspect-video bg-gray-100 relative">
                  {project.image_url ? (
                    <Image
                      src={project.image_url}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => router.push(`/portfolio/${project.id}/edit`)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Edit className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => {
                        setProjectToDelete(project)
                        setDeleteDialogOpen(true)
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t.deleteTitle}
        message={t.deleteMessage}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

