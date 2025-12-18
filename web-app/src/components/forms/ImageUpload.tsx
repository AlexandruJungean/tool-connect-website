'use client'

import React, { useCallback, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  bucket?: string
  folder?: string
  label?: string
  aspectRatio?: 'square' | 'video' | 'cover'
  maxSizeMB?: number
  error?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'avatars',
  folder = '',
  label,
  aspectRatio = 'square',
  maxSizeMB = 5,
  error,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const aspectRatios = {
    square: 'aspect-square',
    video: 'aspect-video',
    cover: 'aspect-[3/1]',
  }

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file')
        return
      }

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setUploadError(`Image must be less than ${maxSizeMB}MB`)
        return
      }

      setIsUploading(true)
      setUploadError(null)

      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = folder ? `${folder}/${fileName}` : fileName

        const { error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(filePath, file)

        if (uploadErr) throw uploadErr

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        onChange(publicUrl)
      } catch (err) {
        console.error('Upload error:', err)
        setUploadError('Failed to upload image. Please try again.')
      } finally {
        setIsUploading(false)
      }
    },
    [bucket, folder, maxSizeMB, onChange]
  )

  const handleRemove = useCallback(() => {
    onChange(null)
    setUploadError(null)
  }, [onChange])

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          'relative rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed',
          aspectRatios[aspectRatio],
          error || uploadError ? 'border-red-300' : 'border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </>
        ) : (
          <label
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center cursor-pointer',
              'hover:bg-gray-200 transition-colors',
              disabled && 'cursor-not-allowed'
            )}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
              className="sr-only"
            />
            {isUploading ? (
              <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  Click to upload
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Max {maxSizeMB}MB
                </span>
              </>
            )}
          </label>
        )}
      </div>

      {(error || uploadError) && (
        <p className="mt-1 text-sm text-red-500">{error || uploadError}</p>
      )}
    </div>
  )
}

