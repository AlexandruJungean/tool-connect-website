'use client'

import React, { useCallback, useState } from 'react'
import { File, X, Upload, FileText, Image, Video, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface UploadedFile {
  name: string
  url: string
  type: string
  size: number
}

interface FileUploadProps {
  value?: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  bucket?: string
  folder?: string
  label?: string
  accept?: string
  maxFiles?: number
  maxSizeMB?: number
  error?: string
  disabled?: boolean
  multiple?: boolean
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image
  if (type.startsWith('video/')) return Video
  if (type.startsWith('audio/')) return Music
  if (type.includes('pdf') || type.includes('document')) return FileText
  return File
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUpload({
  value = [],
  onChange,
  bucket = 'documents',
  folder = '',
  label,
  accept = '*/*',
  maxFiles = 5,
  maxSizeMB = 10,
  error,
  disabled = false,
  multiple = true,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length === 0) return

      // Check max files limit
      if (value.length + files.length > maxFiles) {
        setUploadError(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Validate file sizes
      const oversizedFile = files.find(f => f.size > maxSizeMB * 1024 * 1024)
      if (oversizedFile) {
        setUploadError(`${oversizedFile.name} is larger than ${maxSizeMB}MB`)
        return
      }

      setIsUploading(true)
      setUploadError(null)

      try {
        const uploadedFiles: UploadedFile[] = []

        for (const file of files) {
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

          uploadedFiles.push({
            name: file.name,
            url: publicUrl,
            type: file.type,
            size: file.size,
          })
        }

        onChange([...value, ...uploadedFiles])
      } catch (err) {
        console.error('Upload error:', err)
        setUploadError('Failed to upload file(s). Please try again.')
      } finally {
        setIsUploading(false)
        // Reset input
        e.target.value = ''
      }
    },
    [bucket, folder, maxSizeMB, maxFiles, onChange, value]
  )

  const handleRemove = useCallback((index: number) => {
    const newFiles = value.filter((_, i) => i !== index)
    onChange(newFiles)
    setUploadError(null)
  }, [onChange, value])

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Upload area */}
      {value.length < maxFiles && (
        <div
          className={cn(
            'relative rounded-xl border-2 border-dashed p-6',
            error || uploadError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <label
            className={cn(
              'flex flex-col items-center justify-center cursor-pointer',
              disabled && 'cursor-not-allowed'
            )}
          >
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileChange}
              disabled={disabled || isUploading}
              className="sr-only"
            />
            {isUploading ? (
              <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 text-center">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Max {maxSizeMB}MB per file • {maxFiles - value.length} remaining
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {/* File list */}
      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          {value.map((file, index) => {
            const FileIcon = getFileIcon(file.type)
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileIcon className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {(error || uploadError) && (
        <p className="mt-2 text-sm text-red-500">{error || uploadError}</p>
      )}
    </div>
  )
}

