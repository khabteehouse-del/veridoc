'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Document {
  id: string
  name: string
  file_type: string
}

interface QueryResult {
  answer: string
  documents: { document_id: string; document_name: string; chunks_used: number }[]
}

export default function MultiDocQuery() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [loadingDocs, setLoadingDocs] = useState(true)

  useEffect(() => {
    fetch('/api/documents/list')
      .then(r => r.json())
      .then(data => setDocuments(data.documents || []))
      .catch(() => toast.error('Failed to load documents'))
      .finally(() => setLoadingDocs(false))
  }, [])

  const toggleDocument = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const handleQuery = async () => {
    if (!question.trim()) return
    if (selected.length < 2) {
      toast.error('Select at least 2 documents to compare')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/query/multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, document_ids: selected })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setResult(data)

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Query failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleQuery()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: '#06B6D4' }}>
          Multi-Document Comparison
        </p>
        <p className="text-xs text-muted-foreground">
          Select 2 or more documents and ask comparative questions across all of them
        </p>
      </div>

      {/* Document selector */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Select Documents ({selected.length} selected)
        </p>
        {loadingDocs ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'oklch(1 0 0 / 5%)' }} />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <p className="text-xs text-muted-foreground">No documents in library. Upload documents first.</p>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <motion.div
                key={doc.id}
                onClick={() => toggleDocument(doc.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200"
                style={{
                  background: selected.includes(doc.id) ? '#06B6D415' : 'oklch(1 0 0 / 3%)',
                  borderColor: selected.includes(doc.id) ? '#06B6D4' : 'oklch(1 0 0 / 8%)',
                  boxShadow: selected.includes(doc.id) ? '0 0 12px #06B6D422' : 'none',
                }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: selected.includes(doc.id) ? '#06B6D4' : 'oklch(1 0 0 / 8%)',
                    border: `1px solid ${selected.includes(doc.id) ? '#06B6D4' : 'oklch(1 0 0 / 20%)'}`,
                  }}
                >
                  {selected.includes(doc.id) && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: '#06B6D410', color: '#06B6D4', border: '1px solid #06B6D430' }}
                >
                  {doc.file_type === 'application/pdf' ? 'PDF' : 'DOCX'}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Selected docs summary */}
      {selected.length > 0 && (
        <div
          className="rounded-lg p-3 border text-xs"
          style={{ background: '#06B6D408', borderColor: '#06B6D433' }}
        >
          <span style={{ color: '#06B6D4' }}>Comparing: </span>
          <span className="text-foreground/80">
            {documents
              .filter(d => selected.includes(d.id))
              .map(d => d.name)
              .join(' vs ')}
          </span>
        </div>
      )}

      {/* Suggested questions */}
      {selected.length >= 2 && !result && !isLoading && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Suggested Questions</p>
          <div className="flex flex-wrap gap-2">
            {[
              'What are the main differences between both documents?',
              'What are the similarities across both documents?',
              'Which document is more favorable?',
              'Compare the key terms and conditions',
              'What obligations exist in both documents?',
              'Compare the risk factors in both documents',
            ].map((suggestion) => (
              <motion.button
                key={suggestion}
                onClick={() => setQuestion(suggestion)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: '#06B6D410',
                  border: '1px solid #06B6D433',
                  color: '#06B6D4',
                }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border"
            style={{ background: 'oklch(1 0 0 / 3%)', borderColor: '#06B6D433' }}
          >
            <div className="px-5 py-3 border-b" style={{ borderColor: '#06B6D422' }}>
              <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#06B6D4' }}>
                Comparative Analysis
              </p>
              <p className="text-xs text-muted-foreground mt-1">{result.documents.map(d => d.document_name).join(' · ')}</p>
            </div>
            <div className="px-5 py-4 space-y-4">
              {result.answer.split('\n\n').filter(p => p.trim()).map((para, i) => {
                const isHeader = para.startsWith('DOCUMENT') || para.startsWith('COMPARISON')
                return isHeader ? (
                  <div key={i}>
                    <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#06B6D4' }}>
                      {para.split('\n')[0].replace(':', '')}
                    </p>
                    {para.split('\n').slice(1).map((line, j) => (
                      <p key={j} className="text-sm leading-7" style={{ color: 'oklch(0.78 0 0)' }}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <p key={i} className="text-sm leading-7" style={{ color: 'oklch(0.78 0 0)' }}>{para}</p>
                )
              })}
            </div>
            <div className="px-5 py-3 border-t flex flex-wrap gap-2" style={{ borderColor: '#06B6D422' }}>
              {result.documents.map(doc => (
                <span
                  key={doc.document_id}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#06B6D410', color: '#06B6D4', border: '1px solid #06B6D430' }}
                >
                  {doc.document_name} — {doc.chunks_used} sections
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl p-4 border"
          style={{ background: 'oklch(1 0 0 / 3%)', borderColor: '#06B6D433' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#06B6D4' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              Retrieving sections from {selected.length} documents...
            </span>
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="mt-auto">
        <div
          className="rounded-xl border p-3 flex gap-3 items-end"
          style={{ background: 'oklch(1 0 0 / 3%)', borderColor: '#06B6D433' }}
        >
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selected.length < 2
              ? 'Select at least 2 documents above to compare...'
              : 'Compare payment terms... What are the differences in risk... Which contract is more favorable?'
            }
            rows={2}
            disabled={selected.length < 2}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed disabled:opacity-40"
          />
          <motion.button
            onClick={handleQuery}
            disabled={!question.trim() || isLoading || selected.length < 2}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
              boxShadow: '0 0 12px #06B6D444',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
