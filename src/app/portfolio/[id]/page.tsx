'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Calendar, User, Share2, ExternalLink, ImageIcon } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LoadingSpinner, ImageViewer, Avatar } from '@/components/ui'
import { AlertCard } from '@/components/cards'
import { supabase } from '@/lib/supabase'
import { formatTimeAgo } from '@/lib/utils'
import { useCategories } from '@/contexts/CategoriesContext'

interface PortfolioProject {
  id: string
  title: string
  description?: string
  image_url?: string
  images?: string[]
  created_at: string
  service_provider_id: string
  service_provider?: {
    id: string
    name: string
    surname: string
    avatar_url?: string
    category?: string | null
  }
}

interface Props {
  params: Promise<{ id: string }>
}

export default function PortfolioDetailPage({ params }: Props) {
  const { id: projectId } = use(params)
  const router = useRouter()
  const { language } = useLanguage()
  const { getCategoryLabel } = useCategories()

  const [project, setProject] = useState<PortfolioProject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const t = {
    title: language === 'cs' ? 'Detail projektu' : 'Project Detail',
    by: language === 'cs' ? 'od' : 'by',
    viewProvider: language === 'cs' ? 'Zobrazit poskytovatele' : 'View Provider',
    share: language === 'cs' ? 'Sdílet' : 'Share',
    notFound: language === 'cs' ? 'Projekt nenalezen' : 'Project not found',
    added: language === 'cs' ? 'Přidáno' : 'Added',
  }

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio_projects')
          .select(`
            *,
            service_provider_profiles:service_provider_id (
              id,
              name,
              surname,
              avatar_url,
              category
            )
          `)
          .eq('id', projectId)
          .single()

        if (error) throw error

        if (data) {
          setProject({
            ...data,
            service_provider: data.service_provider_profiles as PortfolioProject['service_provider'],
          })
        }
      } catch (err) {
        console.error('Failed to fetch project:', err)
        setError(t.notFound)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId, t.notFound])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project?.title,
          text: project?.description,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  const allImages = project?.images?.length 
    ? project.images 
    : project?.image_url 
      ? [project.image_url] 
      : []

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AlertCard variant="error" message={error || t.notFound} />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold truncate">{project.title}</h1>
          </div>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {/* Main Image */}
        {allImages.length > 0 ? (
          <div
            className="relative aspect-video bg-gray-200 cursor-pointer"
            onClick={() => {
              setSelectedImageIndex(0)
              setImageViewerOpen(true)
            }}
          >
            <Image
              src={allImages[0]}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Additional images gallery */}
        {allImages.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto bg-white border-b">
            {allImages.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedImageIndex(index)
                  setImageViewerOpen(true)
                }}
                className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                <Image
                  src={img}
                  alt={`${project.title} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="p-4 space-y-6">
          {/* Title & Meta */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{t.added} {formatTimeAgo(project.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="bg-white rounded-2xl p-4 shadow-card">
              <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
            </div>
          )}

          {/* Provider Card */}
          {project.service_provider && (
            <button
              onClick={() => router.push(`/providers/${project.service_provider?.id}`)}
              className="w-full bg-white rounded-2xl p-4 shadow-card flex items-center gap-4 text-left hover:shadow-card-hover transition-shadow"
            >
              <Avatar
                src={project.service_provider.avatar_url}
                fallbackInitials={`${project.service_provider.name?.[0] || ''}${project.service_provider.surname?.[0] || ''}`}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">
                  {project.service_provider.name} {project.service_provider.surname}
                </p>
                {project.service_provider.category && (
                  <p className="text-sm text-gray-500 truncate">
                    {getCategoryLabel(project.service_provider.category, language)}
                  </p>
                )}
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Image Viewer */}
      <ImageViewer
        images={allImages}
        initialIndex={selectedImageIndex}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        alt={project.title}
      />
    </div>
  )
}

