"use client"

import { useState, useCallback } from "react"
import { Upload, ImageIcon, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadSectionProps {
  onImageUpload: (file: File) => void
  isProcessing: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export function UploadSection({ onImageUpload, isProcessing }: UploadSectionProps) {
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
    <section id="upload" className="py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer",
            isDragging 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-border bg-card hover:border-primary/50 hover:bg-muted/50",
            isProcessing && "pointer-events-none opacity-50"
          )}
        >
          <input
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
              isDragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {isDragging ? (
                <ImageIcon className="w-8 h-8" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium text-foreground mb-1">
                {isDragging ? "Lepaskan gambar di sini" : "Seret & lepas gambar di sini"}
              </p>
              <p className="text-sm text-muted-foreground">
                atau klik untuk memilih file
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>JPG, PNG, WebP</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span>Maks. 10MB</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto hover:bg-destructive/20 rounded-lg p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
