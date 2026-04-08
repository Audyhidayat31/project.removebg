"use client"

import { useState, useCallback, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { HeroUploadSection } from "@/components/hero-upload-section"
import { ResultSection } from "@/components/result-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { Footer } from "@/components/footer"
import { removeBackground, type RemovalProgress } from "@/lib/background-removal"

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<RemovalProgress | null>(null)

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string)
      setProcessedImage(null)
      setError(null)
      setUploadedFile(file)
      setProgress(null)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRemoveBackground = useCallback(async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setError(null)
    setProgress(null)

    try {
      const result = await removeBackground(uploadedFile, (p) => {
        setProgress(p)
      })

      setProcessedImage(result)
    } catch (err) {
      console.error("Background removal error:", err)
      setError(
        err instanceof Error
          ? `Gagal memproses: ${err.message}`
          : "Terjadi kesalahan saat memproses gambar"
      )
    } finally {
      setIsProcessing(false)
      setProgress(null)
    }
  }, [uploadedFile])

  const handleReset = useCallback(() => {
    setOriginalImage(null)
    setProcessedImage(null)
    setUploadedFile(null)
    setError(null)
    setProgress(null)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {!originalImage ? (
        <>
          <HeroUploadSection 
            onImageUpload={handleImageUpload} 
            isProcessing={isProcessing} 
          />
          <FeaturesSection />
          <HowItWorksSection />
        </>
      ) : (
        <div className="pt-24">
          <ResultSection
            originalImage={originalImage}
            processedImage={processedImage}
            isProcessing={isProcessing}
            progress={progress}
            onReset={handleReset}
            onRemoveBackground={handleRemoveBackground}
          />
          
          {error && (
            <div className="max-w-2xl mx-auto px-6 pb-8">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center">
                {error}
              </div>
            </div>
          )}
        </div>
      )}
      
      <Footer />
    </main>
  )
}

