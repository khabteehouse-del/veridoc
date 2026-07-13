'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ExtractionResult {
  document_type: string
  parties: string[]
  effective_date: string | null
  expiry_date: string | null
  contract_value: string | null
  governing_law: string | null
  payment_terms: string | null
  notice_period: string | null
  key_obligations: string[]
  identified_risks: string[]
  termination_conditions: string[]
  confidentiality_clause_present: boolean
}

interface ExtractionViewProps {
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
          <div
            className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top left, #06B6D420 0%, transparent 70%)',
            }}
          />
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

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm text-foreground font-mono">
        {value ? value : <span className="text-muted-foreground/50">Not found</span>}
      </p>
    </div>
  )
}

function ListField({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground/50 font-mono">None identified</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              {item}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ExtractionView({ documentId, documentName }: ExtractionViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ExtractionResult | null>(null)

  const handleExtract = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setResult(data.extraction)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Extraction failed')
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
          onClick={handleExtract}
          disabled={isLoading}
          whileHover={{ scale: 1.02, boxShadow: '0 0 25px #06B6D466' }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-primary/10 veridoc-border border text-sm veridoc-text font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/20 transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Extracting structured data...
            </span>
          ) : (
            'Extract Contract Data'
          )}
        </motion.button>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <HoverCard className="p-5 space-y-4">
            <p className="text-xs veridoc-text font-medium uppercase tracking-wider">Contract Overview</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Document Type" value={result.document_type} />
              <Field label="Governing Law" value={result.governing_law} />
              <Field label="Effective Date" value={result.effective_date} />
              <Field label="Expiry Date" value={result.expiry_date} />
              <Field label="Contract Value" value={result.contract_value} />
              <Field label="Notice Period" value={result.notice_period} />
            </div>
            <div className="pt-2 border-t border-white/8">
              <Field label="Payment Terms" value={result.payment_terms} />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/8">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Confidentiality Clause</span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${result.confidentiality_clause_present ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
              >
                {result.confidentiality_clause_present ? 'Present' : 'Not Found'}
              </motion.span>
            </div>
          </HoverCard>

          <HoverCard className="p-5 space-y-3">
            <p className="text-xs veridoc-text font-medium uppercase tracking-wider">Parties</p>
            <ul className="space-y-1.5">
              {result.parties.map((party, index) => (
                <li key={index} className="text-sm text-foreground font-mono">{party}</li>
              ))}
            </ul>
          </HoverCard>

          <HoverCard className="p-5 space-y-4">
            <p className="text-xs veridoc-text font-medium uppercase tracking-wider">Intelligence</p>
            <ListField label="Key Obligations" items={result.key_obligations} />
            <div className="border-t border-white/8 pt-4">
              <ListField label="Identified Risks" items={result.identified_risks} />
            </div>
            <div className="border-t border-white/8 pt-4">
              <ListField label="Termination Conditions" items={result.termination_conditions} />
            </div>
          </HoverCard>

          <motion.button
            onClick={() => setResult(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Re-extract
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
