"use client"

import Link from "next/link"
import { ImageIcon, Heart, Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Top divider */}
      <div className="section-divider" />

      <div className="hero-gradient py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* CTA Section */}
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Siap Menghapus Background?
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Mulai sekarang dan rasakan kemudahan menghapus background gambar dengan AI
            </p>
            <Link
              href="#upload"
              className="cta-button text-base px-8 py-3.5 inline-flex items-center gap-2"
            >
              Coba Sekarang — Gratis
            </Link>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/10 mb-8" />

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center transition-transform group-hover:scale-105">
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">RemovedBG</span>
            </Link>

            {/* Copyright */}
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              © {new Date().getFullYear()} RemovedBG. Dibuat dengan
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              dan AI
            </p>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors duration-300">
                Privasi
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300">
                Syarat & Ketentuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
