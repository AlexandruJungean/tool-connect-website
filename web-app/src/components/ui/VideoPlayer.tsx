'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
  poster?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  className?: string
  onEnded?: () => void
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = false,
  loop = false,
  className,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(muted)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [volume, setVolume] = useState(1)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Play/Pause
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

  // Mute/Unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = value
      setVolume(value)
      setIsMuted(value === 0)
    }
  }

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = value
      setCurrentTime(value)
      setProgress((value / duration) * 100)
    }
  }

  // Progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / rect.width
      const newTime = pos * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setProgress(pos * 100)
    }
  }

  // Fullscreen - prefer video element for better mobile/orientation support
  const toggleFullscreen = async () => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    try {
      if (!isFullscreen) {
        // Try video element first (better for mobile), fallback to container
        if (video.requestFullscreen) {
          await video.requestFullscreen()
        } else if ((video as any).webkitRequestFullscreen) {
          await (video as any).webkitRequestFullscreen()
        } else if ((video as any).webkitEnterFullscreen) {
          // iOS Safari
          await (video as any).webkitEnterFullscreen()
        } else if (container.requestFullscreen) {
          await container.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  // Restart
  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  // Auto-hide controls
  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  // Event listeners
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      setProgress((video.currentTime / video.duration) * 100)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [onEnded])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenEl = document.fullscreenElement || (document as any).webkitFullscreenElement
      const isVideoOrContainerFullscreen = 
        fullscreenEl === videoRef.current || 
        fullscreenEl === containerRef.current
      setIsFullscreen(!!fullscreenEl && isVideoOrContainerFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    
    // iOS Safari
    const video = videoRef.current
    if (video) {
      video.addEventListener('webkitbeginfullscreen', () => setIsFullscreen(true))
      video.addEventListener('webkitendfullscreen', () => setIsFullscreen(false))
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      if (video) {
        video.removeEventListener('webkitbeginfullscreen', () => setIsFullscreen(true))
        video.removeEventListener('webkitendfullscreen', () => setIsFullscreen(false))
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black overflow-hidden group',
        isFullscreen 
          ? 'fixed inset-0 z-50 flex items-center justify-center' 
          : 'rounded-xl',
        className
      )}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        className={cn(
          'object-contain',
          isFullscreen 
            ? 'max-w-full max-h-full w-auto h-auto' 
            : 'w-full h-full'
        )}
        onClick={togglePlay}
      />

      {/* Play overlay (when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="w-10 h-10 text-gray-900 ml-1" />
          </div>
        </button>
      )}

      {/* Controls */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Progress bar */}
        <div
          className="relative h-1 bg-white/30 rounded-full cursor-pointer mb-4 group/progress"
          onClick={handleProgressClick}
        >
          <div
            className="absolute h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-gray-300">
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            {/* Restart */}
            <button onClick={restart} className="text-white hover:text-gray-300">
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white hover:text-gray-300">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Time */}
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-gray-300">
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

