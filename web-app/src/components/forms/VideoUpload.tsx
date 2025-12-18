'use client'

import React, { useCallback, useState, useRef } from 'react'
import { Video, X, Upload, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface VideoUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  bucket?: string
  folder?: string
  label?: string
  maxSizeMB?: number
  maxDurationSeconds?: number
  error?: string
  disabled?: boolean
}

export function VideoUpload({
  value,
  onChange,
  bucket = 'videos',
  folder = '',
  label,
  maxSizeMB = 50,
  maxDurationSeconds = 60,
  error,
  disabled = false,
}: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('video/')) {
        setUploadError('Please select a video file')
        return
      }

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setUploadError(`Video must be less than ${maxSizeMB}MB`)
        return
      }

      // Validate duration
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      const durationCheck = new Promise<boolean>((resolve) => {
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src)
          if (video.duration > maxDurationSeconds) {
            setUploadError(`Video must be less than ${maxDurationSeconds} seconds`)
            resolve(false)
          } else {
            resolve(true)
          }
        }
        video.onerror = () => resolve(true) // Skip check on error
      })
      
      video.src = URL.createObjectURL(file)
      const isValidDuration = await durationCheck

      if (!isValidDuration) return

      setIsUploading(true)
      setUploadError(null)
      setUploadProgress(0)

      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = folder ? `${folder}/${fileName}` : fileName

        const { error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadErr) throw uploadErr

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        onChange(publicUrl)
        setUploadProgress(100)
      } catch (err) {
        console.error('Upload error:', err)
        setUploadError('Failed to upload video. Please try again.')
      } finally {
        setIsUploading(false)
      }
    },
    [bucket, folder, maxSizeMB, maxDurationSeconds, onChange]
  )

  const handleRemove = useCallback(() => {
    onChange(null)
    setUploadError(null)
  }, [onChange])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          'relative rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed aspect-video',
          error || uploadError ? 'border-red-300' : 'border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {value ? (
          <>
            <video
              ref={videoRef}
              src={value}
              className="w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Play overlay */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
              >
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-gray-900 ml-1" />
                </div>
              </button>
            )}
            
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 z-10"
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
              accept="video/*"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
              className="sr-only"
            />
            {isUploading ? (
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
            ) : (
              <>
                <Video className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  Click to upload video
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Max {maxSizeMB}MB, {maxDurationSeconds}s
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

