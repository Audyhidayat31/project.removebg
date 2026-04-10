"use client"

import { useState } from "react"
import Image from "next/image"
import { Download, RefreshCw, ZoomIn, X, Layers, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RemovalProgress } from "@/lib/background-removal"

interface ResultSectionProps {
  originalImage: string | null
  processedImage: string | null
  isProcessing: boolean
  progress: RemovalProgress | null
  onReset: () => void
  onRemoveBackground: () => void
}

export function ResultSection({
  originalImage,
  processedImage,
  isProcessing,
  progress,
  onReset,
  onRemoveBackground,
}: ResultSectionProps) {
  const [viewMode, setViewMode] = useState<"side-by-side" | "slider">("side-by-side")
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isZoomed, setIsZoomed] = useState(false)

  const handleDownload = () => {
    if (!processedImage) return
    
    const link = document.createElement("a")
    link.href = processedImage
    link.download = "hasil-tanpa-background.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSliderChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  if (!originalImage) return null

  return (
    <section className="py-16 px-6 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onReset}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-all">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </div>
          <span className="font-medium">Kembali</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-sm text-blue-600 font-medium mb-4">
            <Layers className="w-4 h-4" />
            Preview Hasil
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Hasil Penghapusan Background
          </h2>
        </div>

        {/* View Mode Toggle */}
        {processedImage && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-1 p-1.5 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewMode("side-by-side")}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                  viewMode === "side-by-side"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Berdampingan
              </button>
              <button
                onClick={() => setViewMode("slider")}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                  viewMode === "slider"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Slider
              </button>
            </div>
          </div>
        )}

        {/* Image Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
          {viewMode === "side-by-side" || !processedImage ? (
            <div className="grid md:grid-cols-2 gap-px bg-slate-200">
              {/* Original Image */}
              <div className="relative bg-white">
                <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-sm text-xs font-medium text-white">
                  Sebelum
                </div>
                <div className="aspect-[4/3] md:aspect-square relative bg-[url('/checkerboard.svg')] bg-repeat bg-[length:20px_20px]">
                  <Image
                    src={originalImage}
                    alt="Gambar asli"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Processed Image or Loading */}
              <div className="relative bg-white">
                <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-sm text-xs font-medium text-white">
                  Sesudah
                </div>
                <div className="aspect-[4/3] md:aspect-square relative bg-[url('/checkerboard.svg')] bg-repeat bg-[length:20px_20px]">
                  {isProcessing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm p-6">
                      {/* Stage Icon */}
                      <div className="relative mb-5">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg">
                            {progress?.stage === "loading" && "🧠"}
                            {progress?.stage === "processing" && "✨"}
                            {progress?.stage === "refining" && "🔍"}
                            {(!progress || progress.stage === "done") && "⚡"}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full max-w-xs mb-3">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress?.progress ?? 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Progress Text */}
                      <p className="text-sm text-slate-600 font-medium text-center">
                        {progress?.message || "Mempersiapkan..."}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {progress?.progress ?? 0}% selesai
                      </p>
                    </div>
                  ) : processedImage ? (
                    <>
                      <Image
                        src={processedImage}
                        alt="Gambar tanpa background"
                        fill
                        className="object-contain"
                      />
                      <button
                        onClick={() => setIsZoomed(true)}
                        className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-lg hover:scale-105"
                      >
                        <ZoomIn className="w-5 h-5 text-slate-700" />
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-sm text-slate-400">Klik tombol untuk memproses</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Slider View */
            <div 
              className="aspect-[4/3] md:aspect-video relative cursor-ew-resize bg-[url('/checkerboard.svg')] bg-repeat bg-[length:20px_20px]"
              onClick={handleSliderChange}
              onMouseMove={(e) => e.buttons === 1 && handleSliderChange(e)}
            >
              {/* Processed Image (Full) */}
              <Image
                src={processedImage}
                alt="Gambar tanpa background"
                fill
                className="object-contain"
              />
              
              {/* Original Image (Clipped) */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <Image
                  src={originalImage}
                  alt="Gambar asli"
                  fill
                  className="object-contain"
                />
              </div>
              
              {/* Slider Line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl">
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-3 bg-slate-400 rounded-full" />
                    <div className="w-0.5 h-3 bg-slate-400 rounded-full" />
                  </div>
                </div>
              </div>
              
              {/* Labels */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-sm text-xs font-medium text-white">
                Sebelum
              </div>
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-sm text-xs font-medium text-white">
                Sesudah
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          {!processedImage && !isProcessing && (
            <button
              onClick={onRemoveBackground}
              className="cta-button w-full sm:w-auto text-lg px-10 py-4 inline-flex items-center justify-center gap-2"
            >
              Hapus Background
            </button>
          )}

          {processedImage && (
            <>
              <button
                onClick={handleDownload}
                className="cta-button w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base"
              >
                <Download className="w-5 h-5" />
                Download PNG
              </button>
              <button
                onClick={onReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300 border border-slate-200"
              >
                <RefreshCw className="w-5 h-5" />
                Upload Gambar Baru
              </button>
            </>
          )}
        </div>

        {/* Zoom Modal */}
        {isZoomed && processedImage && (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setIsZoomed(false)}
          >
            <button 
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setIsZoomed(false)}
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="relative w-full max-w-4xl aspect-square bg-[url('/checkerboard.svg')] bg-repeat bg-[length:20px_20px] rounded-2xl overflow-hidden">
              <Image
                src={processedImage}
                alt="Gambar tanpa background"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
