"use client"

import { useState, useCallback } from "react"
import { Upload, ImageIcon, X, AlertCircle, Sparkles, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroUploadSectionProps {
  onImageUpload: (file: File) => void
  isProcessing: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export function HeroUploadSection({ onImageUpload, isProcessing }: HeroUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Format file tidak didukung. Gunakan JPG, PNG, atau WebP."
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Ukuran file terlalu besar. Maksimal 10MB."
    }
    return null
  }

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    onImageUpload(file)
  }, [onImageUpload])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }, [handleFile])

  return (
    <section id="upload" className="hero-gradient min-h-screen flex items-center relative">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-500/10"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Hero Text */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300 mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Powered by AI Technology</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              Hapus Background Gambar{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                dalam Sekejap
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-lg mb-10 leading-relaxed animate-slide-up-delay-1">
              Upload gambar Anda dan biarkan AI menghapus background secara otomatis. 
              Gratis, cepat, dan hasil profesional.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 animate-slide-up-delay-2">
              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-sm text-slate-500">Gratis</p>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div>
                <p className="text-2xl font-bold text-white">&lt;5s</p>
                <p className="text-sm text-slate-500">Proses</p>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div>
                <p className="text-2xl font-bold text-white">HD</p>
                <p className="text-sm text-slate-500">Kualitas</p>
              </div>
            </div>
          </div>

          {/* Right Side - Upload Area */}
          <div className="animate-slide-up-delay-2">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "upload-box-hero p-8 md:p-10 text-center cursor-pointer relative",
                isDragging && "dragging",
                isProcessing && "pointer-events-none opacity-50"
              )}
            >
              <input
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
                id="file-upload"
              />

              <div className="flex flex-col items-center gap-5">
                {/* Upload Icon */}
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
                  isDragging
                    ? "bg-blue-500/20 scale-110"
                    : "bg-white/5"
                )}>
                  {isDragging ? (
                    <ImageIcon className="w-10 h-10 text-blue-400" />
                  ) : (
                    <Upload className="w-10 h-10 text-blue-400" />
                  )}
                </div>

                {/* Text */}
                <div>
                  <p className="text-lg font-semibold text-white mb-2">
                    {isDragging ? "Lepaskan gambar di sini" : "Seret & lepas gambar di sini"}
                  </p>
                  <p className="text-sm text-slate-400">
                    atau klik untuk memilih file dari perangkat Anda
                  </p>
                </div>

                {/* CTA Button */}
                <button 
                  className="cta-button text-base px-8 py-3.5 inline-flex items-center gap-2 mt-2"
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById('file-upload')?.click()
                  }}
                >
                  Pilih Gambar
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* File Info */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    JPG, PNG, WebP
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Maks. 10MB
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto hover:bg-red-500/20 rounded-lg p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 80L60 74.7C120 69 240 59 360 53.3C480 48 600 48 720 53.3C840 59 960 69 1080 69.3C1200 69 1320 59 1380 53.3L1440 48V80H0Z"
            fill="var(--background)"
          />
        </svg>
      </div>
    </section>
  )
}
