'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface SummaryResult {
  summary: string
  key_points: string[]
  document_name: string
}

interface SummaryViewProps {
  documentId: string
  documentName: string
}

function HoverCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -2 }}
      className={`rounded-xl border transition-all duration-300 relative overflow-hidden ${className}`}
      style={{
        background: hovered
          ? 'linear-gradient(135deg, oklch(0.13 0 0), oklch(0.15 0.02 195))'
          : 'oklch(1 0 0 / 3%)',
        boxShadow: hovered
          ? '0 0 30px #06B6D4aa, 0 0 60px #3B82F620, inset 0 0 20px #06B6D408'
          : '0 2px 8px rgba(0,0,0,0.2)',
        borderColor: hovered ? '#06B6D4' : 'oklch(1 0 0 / 8%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {hovered && (
        <>
          {/* Teal corner glow */}
          <div
            className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top left, #06B6D420 0%, transparent 70%)',
            }}
          />
          {/* Scan line */}
          <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
            <motion.div
              className="absolute left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, #06B6D4, #3B82F6, transparent)',
              }}
              initial={{ top: '0%', opacity: 0 }}
              animate={{ top: ['0%', '100%'], opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.9, ease: 'linear' }}
            />
          </div>
        </>
      )}
      {children}
    </motion.div>
  )
}

export default function SummaryView({ documentId, documentName }: SummaryViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)

  const handleSummarize = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setResult(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Summarization failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground px-1">
        Document: <span className="veridoc-text font-medium">{documentName}</span>
      </div>

      {!result && (
        <motion.button
          onClick={handleSummarize}
          disabled={isLoading}
          whileHover={{ scale: 1.02, boxShadow: '0 0 25px #06B6D466' }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-primary/10 veridoc-border border text-sm veridoc-text font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/20 transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Generating summary...
            </span>
          ) : (
            'Generate Executive Summary'
          )}
        </motion.button>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <HoverCard className="p-5 space-y-3">
            <p className="text-xs veridoc-text font-medium uppercase tracking-wider">Executive Summary</p>
            <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
          </HoverCard>

          <HoverCard className="p-5 space-y-3">
            <p className="text-xs veridoc-text font-medium uppercase tracking-wider">Key Points</p>
            <ul className="space-y-2">
              {result.key_points.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-start gap-3 text-sm text-foreground"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {point}
                </motion.li>
              ))}
            </ul>
          </HoverCard>

          <motion.button
            onClick={() => setResult(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Regenerate
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
