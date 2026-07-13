'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface HeaderProps {
  onNavigateHome?: () => void
  onNavigateLibrary?: () => void
  currentView?: string
}

export default function Header({ onNavigateHome, onNavigateLibrary, currentView }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/8"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Left — logo + nav */}
        <div className="flex items-center gap-6">
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            onClick={onNavigateHome}
            whileHover={{ opacity: 0.8 }}
          >
            <div
              className="relative flex-shrink-0"
              style={{ width: '40px', height: '40px' }}
            >
              <Image
                src="/logo-icon.png"
                alt="Veridoc"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">Veridoc</span>
          </motion.div>

          {/* Navigation links */}
          <nav className="hidden sm:flex items-center gap-1">
            <motion.button
              onClick={onNavigateHome}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{
                color: currentView === 'landing' ? '#06B6D4' : 'oklch(0.6 0 0)',
                background: currentView === 'landing' ? '#06B6D410' : 'transparent',
                border: currentView === 'landing' ? '1px solid #06B6D433' : '1px solid transparent',
              }}
            >
              Home
            </motion.button>
            <motion.button
              onClick={onNavigateLibrary}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{
                color: currentView === 'library' ? '#06B6D4' : 'oklch(0.6 0 0)',
                background: currentView === 'library' ? '#06B6D410' : 'transparent',
                border: currentView === 'library' ? '1px solid #06B6D433' : '1px solid transparent',
              }}
            >
              Library
            </motion.button>
          </nav>
        </div>

        {/* Right — status */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border"
          style={{ borderColor: '#06B6D433' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">Systems Operational</span>
        </div>

      </div>
    </motion.header>
  )
}
