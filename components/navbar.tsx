"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ImageIcon, Menu, X } from "lucide-react"

interface NavbarProps {
  onStartFree?: () => void;
}

export function Navbar({ onStartFree }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleClickMulaiGratis = (e: React.MouseEvent) => {
    if (onStartFree) {
      e.preventDefault()
      onStartFree()
      setMobileMenuOpen(false)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "navbar-scrolled shadow-lg" : "navbar-glass"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-blue-500/25">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <span
            className={`font-bold text-lg tracking-tight transition-colors duration-500 ${scrolled ? "text-slate-900" : "text-white"
              }`}
          >
            RemovedBG
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className={`text-sm font-medium transition-colors duration-300 hover:text-blue-400 ${scrolled ? "text-slate-600" : "text-white/70"
              }`}
          >
            Fitur
          </Link>
          <Link
            href="#how-it-works"
            className={`text-sm font-medium transition-colors duration-300 hover:text-blue-400 ${scrolled ? "text-slate-600" : "text-white/70"
              }`}
          >
            Cara Kerja
          </Link>
          <Link
            href="#upload"
            onClick={handleClickMulaiGratis}
            className="cta-button text-sm px-5 py-2.5 inline-flex items-center gap-2"
          >
            Mulai Gratis
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-slate-900 hover:bg-slate-100" : "text-white hover:bg-white/10"
            }`}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden px-6 pb-4 ${scrolled ? "bg-white" : "bg-slate-900/95 backdrop-blur-lg"}`}>
          <div className="flex flex-col gap-3">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium py-2 ${scrolled ? "text-slate-600" : "text-white/70"}`}
            >
              Fitur
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium py-2 ${scrolled ? "text-slate-600" : "text-white/70"}`}
            >
              Cara Kerja
            </Link>
            <Link
              href="#upload"
              onClick={handleClickMulaiGratis}
              className="cta-button text-sm px-5 py-2.5 text-center"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
