"use client"

import { Zap, Shield, Sparkles, ArrowUpRight } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Super Cepat",
    description: "Proses dalam hitungan detik dengan teknologi AI canggih. Tidak perlu menunggu lama.",
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-500/20",
  },
  {
    icon: Shield,
    title: "Privasi Terjamin",
    description: "Gambar Anda tidak disimpan dan langsung dihapus setelah diproses. Aman & terpercaya.",
    color: "from-emerald-400 to-green-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: Sparkles,
    title: "Hasil Profesional",
    description: "Deteksi objek akurat dengan tepi yang halus dan natural. Kualitas setara premium.",
    color: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-500/20",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 grid-bg relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-sm text-blue-600 font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Keunggulan Kami
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Mengapa Memilih{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              RemovedBG?
            </span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            Solusi terbaik untuk menghapus background gambar dengan mudah dan cepat
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 ${feature.shadow} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                {feature.title}
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
