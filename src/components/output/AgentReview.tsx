'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface AgentStep {
  id: number
  label: string
  status: 'pending' | 'running' | 'complete'
}

interface RiskAnalysis {
  risk_level: string
  risk_summary: string
  red_flags: string[]
  recommendations: string[]
}

interface Extraction {
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

interface Summary {
  summary: string
  key_points: string[]
}

interface Report {
  extraction: Extraction
  risk_analysis: RiskAnalysis
  summary: Summary
  conclusion: string
  reviewed_at: string
}

interface AgentReviewProps {
  documentId: string
  documentName: string
}

const STEPS: AgentStep[] = [
  { id: 1, label: 'Extracting structured contract data', status: 'pending' },
  { id: 2, label: 'Analyzing risks and red flags', status: 'pending' },
  { id: 3, label: 'Generating executive summary', status: 'pending' },
  { id: 4, label: 'Compiling final review report', status: 'pending' },
]

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    Low: { bg: '#10b98115', text: '#10b981', border: '#10b98133' },
    Medium: { bg: '#f59e0b15', text: '#f59e0b', border: '#f59e0b33' },
    High: { bg: '#ef444415', text: '#ef4444', border: '#ef444433' },
  }
  const c = colors[level] || colors.Medium
  return (
    <span
      className="text-xs font-semibold px-3 py-1 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {level} Risk
    </span>
  )
}

export default function AgentReview({ documentId, documentName }: AgentReviewProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<AgentStep[]>(STEPS)
  const [report, setReport] = useState<Report | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const runAgent = async () => {
    setIsRunning(true)
    setReport(null)
    setSteps(STEPS.map(s => ({ ...s, status: 'pending' })))
    setCurrentStep(0)

    // Animate steps as agent runs
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1
        setSteps(s => s.map((step, i) => ({
          ...step,
          status: i < prev ? 'complete' : i === prev ? 'running' : 'pending'
        })))
        if (next >= 4) clearInterval(stepInterval)
        return next
      })
    }, 4000)

    try {
      const response = await fetch('/api/agent/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId })
      })

      clearInterval(stepInterval)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setSteps(STEPS.map(s => ({ ...s, status: 'complete' })))
      setReport(data.report)
      toast.success('Contract review complete')

    } catch (error) {
      clearInterval(stepInterval)
      toast.error(error instanceof Error ? error.message : 'Agent review failed')
      setSteps(STEPS.map(s => ({ ...s, status: 'pending' })))
    } finally {
      setIsRunning(false)
      setCurrentStep(0)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: '#06B6D4' }}>
            Contract Review Agent
          </p>
          <p className="text-xs text-muted-foreground">
            Autonomous 4-step review — extraction, risk analysis, summary, and report
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {documentName}
        </div>
      </div>

      {/* Run button */}
      {!isRunning && !report && (
        <motion.button
          onClick={runAgent}
          whileHover={{ scale: 1.02, boxShadow: '0 0 30px #06B6D466' }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl text-sm font-semibold relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
            color: 'white',
          }}
        >
          <motion.div
            className="absolute left-0 right-0 h-px pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            }}
            animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <span className="relative z-10">⚡ Run Full Contract Review</span>
        </motion.button>
      )}

      {/* Agent steps */}
      <AnimatePresence>
        {(isRunning || report) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{
                  background: step.status === 'complete' ? '#06B6D408' : step.status === 'running' ? '#06B6D415' : 'oklch(1 0 0 / 2%)',
                  borderColor: step.status === 'complete' ? '#06B6D433' : step.status === 'running' ? '#06B6D4' : 'oklch(1 0 0 / 8%)',
                }}
              >
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {step.status === 'complete' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" fill="#06B6D4" />
                        <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  )}
                  {step.status === 'running' && (
                    <div className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{ borderColor: '#06B6D4', borderTopColor: 'transparent' }} />
                  )}
                  {step.status === 'pending' && (
                    <div className="w-4 h-4 rounded-full border-2 border-white/20" />
                  )}
                </div>
                <span className={`text-xs ${step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                  Step {step.id} — {step.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Risk header */}
            <div
              className="rounded-xl p-5 border space-y-3"
              style={{ background: 'oklch(1 0 0 / 3%)', borderColor: '#06B6D433' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#06B6D4' }}>
                  Risk Assessment
                </p>
                {report.risk_analysis?.risk_level && (
                  <RiskBadge level={report.risk_analysis.risk_level} />
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {report.risk_analysis?.risk_summary}
              </p>
              {report.risk_analysis?.red_flags?.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/8">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Red Flags</p>
                  {report.risk_analysis.red_flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {flag}
                    </div>
                  ))}
                </div>
              )}
              {report.risk_analysis?.recommendations?.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/8">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Recommendations</p>
                  {report.risk_analysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#06B6D4' }} />
                      {rec}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key details */}
            <div
              className="rounded-xl p-5 border space-y-3"
              style={{ background: 'oklch(1 0 0 / 3%)', borderColor: '#06B6D433' }}
            >
              <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#06B6D4' }}>
                Contract Details
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Type', value: report.extraction?.document_type },
                  { label: 'Governing Law', value: report.extraction?.governing_law },
                  { label: 'Effective Date', value: report.extraction?.effective_date },
                  { label: 'Notice Period', value: report.extraction?.notice_period },
                  { label: 'Contract Value', value: report.extraction?.contract_value },
                  { label: 'Payment Terms', value: report.extraction?.payment_terms },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xs text-foreground font-mono mt-0.5">{value || 'Not found'}</p>
                  </div>
                ))}
              </div>
              {report.extraction?.parties?.length > 0 && (
                <div className="pt-2 border-t border-white/8">
                  <p className="text-xs text-muted-foreground mb-1.5">Parties</p>
                  {report.extraction.parties.map((party, i) => (
                    <p key={i} className="text-xs text-foreground font-mono">{party}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div
              className="rounded-xl p-5 border space-y-3"
              style={{ background: 'oklch(1 0 0 / 3%)', borderColor: '#06B6D433' }}
            >
              <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#06B6D4' }}>
                Executive Summary
              </p>
              <p className="text-sm text-foreground leading-7">{report.summary?.summary}</p>
              {report.summary?.key_points?.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/8">
                  {report.summary.key_points.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#06B6D4' }} />
                      {point}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Conclusion */}
            <div
              className="rounded-xl p-5 border space-y-3"
              style={{ background: 'oklch(1 0 0 / 3%)', borderColor: '#06B6D433' }}
            >
              <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#06B6D4' }}>
                Agent Conclusion
              </p>
              <p className="text-sm text-foreground leading-7">
                {report.conclusion.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
              </p>
              <p className="text-xs text-muted-foreground">
                Reviewed at {new Date(report.reviewed_at).toLocaleString()}
              </p>
            </div>

            {/* Re-run */}
            <motion.button
              onClick={() => { setReport(null); setSteps(STEPS.map(s => ({ ...s, status: 'pending' }))); }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Run again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
