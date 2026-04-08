"use client"

import { ArrowDown } from "lucide-react"

export function HeroSection() {
  const scrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Powered by AI
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6 text-balance">
          Hapus Background Gambar{" "}
          <span className="text-primary">dalam Sekejap</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
          Upload gambar Anda dan biarkan AI menghapus background secara otomatis. 
          Gratis, cepat, dan hasil profesional.
        </p>
        
        <button
          onClick={scrollToUpload}
          className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
        >
          Mulai Sekarang
          <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
        </button>
      </div>
    </section>
  )
}
