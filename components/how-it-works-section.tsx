"use client"

import { Upload, Cpu, Download } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Gambar",
    description: "Seret & lepas atau pilih gambar dari perangkat Anda. Mendukung format JPG, PNG, dan WebP.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Proses Otomatis",
    description: "AI akan mendeteksi dan menghapus background secara otomatis dalam hitungan detik.",
  },
  {
    number: "03",
    icon: Download,
    title: "Download Hasil",
    description: "Unduh gambar dengan background transparan dalam format PNG berkualitas tinggi.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-sm text-blue-600 font-medium mb-4">
            <Cpu className="w-4 h-4" />
            Mudah & Cepat
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Cara Kerja{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              HapusBG
            </span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            Hanya 3 langkah mudah untuk mendapatkan gambar tanpa background
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-[3.5rem] left-[20%] right-[20%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400" />
          </div>

          {steps.map((step, index) => (
            <div key={index} className="step-card group">
              {/* Step Number */}
              <div className="step-number mb-6 mx-auto relative">
                {step.number}
                <div className="absolute -inset-2 rounded-xl bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-5 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors duration-300">
                <step.icon className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {step.title}
              </h3>
              <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
