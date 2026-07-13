'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DocumentPreviewProps {
  documentId: string
  documentName: string
  onClose: () => void
}

export default function DocumentPreview({ documentId, documentName, onClose }: DocumentPreviewProps) {
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchContent()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [documentId])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/documents/content?document_id=${documentId}`)
      const data = await response.json()
      setContent(data.content || '')
    } catch {
      setContent('Failed to load document content.')
    } finally {
      setIsLoading(false)
    }
  }

  const preprocessContent = (text: string): string => {
    const lines = text.split('\n')
    const merged: string[] = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i].trim()
      const nextLine = lines[i + 1]?.trim() || ''

      if (!line) {
        if (merged.length > 0 && merged[merged.length - 1] !== '---BREAK---') {
          merged.push('---BREAK---')
        }
        i++
        continue
      }

      // Very short line — likely superscript or orphaned word fragment
      // Join with previous line if it exists and isn't a break
      if (line.length <= 4 && merged.length > 0 && merged[merged.length - 1] !== '---BREAK---') {
        merged[merged.length - 1] = merged[merged.length - 1] + line
        i++
        continue
      }

      // Line starts lowercase AND previous line doesn't end with punctuation — continuation
      if (line.length > 0 && /^[a-z]/.test(line) && merged.length > 0) {
        const last = merged[merged.length - 1]
        if (last !== '---BREAK---' && !/[.!?:;]$/.test(last)) {
          merged[merged.length - 1] = last + ' ' + line
          i++
          continue
        }
      }

      merged.push(line)
      i++
    }

    return merged
      .filter((l, idx, arr) => !(l === '---BREAK---' && (idx === 0 || arr[idx - 1] === '---BREAK---')))
      .join('\n')
  }

  const renderContent = (text: string) => {
    const processed = preprocessContent(text)
    const blocks = processed.split('---BREAK---')
    const elements: React.ReactElement[] = []

    blocks.forEach((block, blockIdx) => {
      const lines = block.split('\n').filter(l => l.trim())

      lines.forEach((line, lineIdx) => {
        const key = `${blockIdx}-${lineIdx}`
        const trimmed = line.trim()

        if (!trimmed) return

        // ALL CAPS heading
        if (trimmed.length > 3 && trimmed.length < 100 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
          elements.push(
            <div key={key} className="mt-6 mb-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #06B6D444, transparent)' }} />
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#06B6D4' }}>
                  {trimmed}
                </p>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #06B6D444)' }} />
              </div>
            </div>
          )
          return
        }

        // Numbered section
        if (/^\d+[\.\d]*\.?\s/.test(trimmed)) {
          elements.push(
            <div key={key} className="flex gap-3 py-1.5 pl-3 border-l-2 my-1" style={{ borderColor: '#06B6D433' }}>
              <p className="text-sm leading-7" style={{ color: 'oklch(0.75 0 0)' }}>{trimmed}</p>
            </div>
          )
          return
        }

        // Short standalone label (like "Between", "And", party names)
        if (trimmed.length < 50 && !trimmed.includes('.') && lines.length <= 3) {
          elements.push(
            <p key={key} className="text-sm font-medium py-0.5 text-center" style={{ color: 'oklch(0.82 0 0)' }}>
              {trimmed}
            </p>
          )
          return
        }

        // Label: Value
        if (trimmed.includes(':') && trimmed.indexOf(':') < 40 && trimmed.length < 150) {
          const colonIdx = trimmed.indexOf(':')
          const label = trimmed.substring(0, colonIdx)
          const value = trimmed.substring(colonIdx + 1).trim()
          elements.push(
            <div key={key} className="flex gap-3 py-1">
              <span className="text-xs font-medium flex-shrink-0 mt-1" style={{ color: '#06B6D4', minWidth: '140px' }}>
                {label}:
              </span>
              <span className="text-sm leading-7" style={{ color: 'oklch(0.72 0 0)' }}>{value}</span>
            </div>
          )
          return
        }

        // Regular paragraph
        elements.push(
          <p key={key} className="text-sm leading-7 py-0.5" style={{ color: 'oklch(0.72 0 0)' }}>
            {trimmed}
          </p>
        )
      })

      // Add spacing between blocks
      if (blockIdx < blocks.length - 1) {
        elements.push(<div key={`gap-${blockIdx}`} className="h-3" />)
      }
    })

    return elements
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'oklch(0.05 0 0 / 92%)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl max-h-[88vh] mx-6 rounded-2xl flex flex-col"
          style={{
            background: 'oklch(0.11 0 0)',
            border: '1px solid #06B6D433',
            boxShadow: '0 0 60px #06B6D418, 0 25px 60px rgba(0,0,0,0.7)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Corner brackets */}
          {[['top-3 left-3', 'M1 6V1H6'], ['top-3 right-3', 'M6 1H11V6'], ['bottom-3 left-3', 'M1 6V11H6'], ['bottom-3 right-3', 'M6 11H11V6']].map(([pos, d], idx) => (
            <div key={idx} className={`absolute ${pos} pointer-events-none`}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d={d} stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          ))}

          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
            style={{ borderColor: '#06B6D418' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: '#06B6D415', color: '#06B6D4' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'oklch(0.88 0 0)' }}>{documentName}</p>
                <p className="text-xs" style={{ color: '#06B6D4' }}>Document Preview</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                border: '1px solid oklch(1 0 0 / 10%)',
                color: 'oklch(0.5 0 0)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.button>
          </div>

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto py-6 px-10"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#06B6D422 transparent' }}
          >
            <div style={{ textAlign: 'justify' }}>
              {isLoading ? (
                <div className="space-y-4">
                  {[90, 75, 85, 60, 80, 70].map((w, i) => (
                    <div key={i} className="h-3 rounded animate-pulse" style={{ background: 'oklch(1 0 0 / 6%)', width: `${w}%` }} />
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {renderContent(content)}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-3 border-t flex items-center justify-between flex-shrink-0"
            style={{ borderColor: '#06B6D418' }}
          >
            <p className="text-xs" style={{ color: 'oklch(0.45 0 0)' }}>
              Press <kbd className="px-1.5 py-0.5 rounded text-xs mx-1"
                style={{ background: 'oklch(1 0 0 / 8%)', border: '1px solid oklch(1 0 0 / 12%)', color: 'oklch(0.6 0 0)' }}>
                Esc
              </kbd> to close
            </p>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ border: '1px solid #06B6D433', color: '#06B6D4', background: '#06B6D408' }}
            >
              Close Preview
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
