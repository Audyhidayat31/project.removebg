"use client"

import { useState, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { HeroUploadSection } from "@/components/hero-upload-section"
import { ResultSection } from "@/components/result-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { Footer } from "@/components/footer"

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string)
      setProcessedImage(null)
      setError(null)
      setUploadedFile(file)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRemoveBackground = useCallback(async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", uploadedFile)

      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses gambar")
      }

      setProcessedImage(data.image)
      
      if (data.demo) {
        setError(data.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsProcessing(false)
    }
  }, [uploadedFile])

  const handleReset = useCallback(() => {
    setOriginalImage(null)
    setProcessedImage(null)
    setUploadedFile(null)
    setError(null)
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
            onReset={handleReset}
            onRemoveBackground={handleRemoveBackground}
          />
          
          {error && (
            <div className="max-w-2xl mx-auto px-6 pb-8">
              <div className="p-4 rounded-xl bg-muted border border-border text-sm text-muted-foreground text-center">
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
