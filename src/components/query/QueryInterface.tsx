'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Source {
  source_number: number
  content_preview: string
  similarity_score: number
  chunk_index: number
}

interface QueryResult {
  answer: string
  sources: Source[]
  question: string
}

interface QueryInterfaceProps {
  documentId: string
  documentName: string
}

export default function QueryInterface({ documentId, documentName }: QueryInterfaceProps) {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)

  const handleQuery = async () => {
    if (!question.trim()) return
    setIsLoading(true)
    const currentQuestion = question
    setQuestion('')

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion, document_id: documentId })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setResult({
        answer: data.answer,
        sources: data.sources,
        question: currentQuestion
      })
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
    <div className="flex flex-col gap-5 h-full min-h-[500px]">

      {/* Document label */}
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Querying</span>
        <span className="text-xs font-semibold" style={{ color: '#06B6D4' }}>{documentName}</span>
      </div>

      <AnimatePresence mode="popLayout">
        {!result && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">Ask anything about your document</p>
              <p className="text-xs text-muted-foreground">
                Who are the parties? What are the payment terms? What are the risks?
              </p>
            </div>
          </motion.div>
        )}

        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl p-5 border"
            style={{
              background: 'oklch(1 0 0 / 3%)',
              borderColor: '#06B6D433',
              backdropFilter: 'blur(12px)',
            }}
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
              <span className="text-xs text-muted-foreground">Retrieving relevant sections...</span>
            </div>
          </motion.div>
        )}

        {result && !isLoading && (
          <motion.div
            key={result.question}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div
              className="rounded-xl border"
              style={{
                background: 'oklch(1 0 0 / 3%)',
                borderColor: '#06B6D433',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Question label */}
              <div
                className="px-5 py-3 border-b"
                style={{ borderColor: '#06B6D422' }}
              >
                <span
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ color: '#06B6D4' }}
                >
                  Query
                </span>
                <p className="text-sm text-muted-foreground mt-1">{result.question}</p>
              </div>

              {/* Answer */}
              <div className="px-5 py-4">
                <span
                  className="text-xs uppercase tracking-widest font-semibold block mb-3"
                  style={{ color: '#06B6D4' }}
                >
                  Response
                </span>
                <p className="text-sm text-foreground leading-7">{result.answer}</p>
              </div>

              {/* Sources */}
              {result.sources.length > 0 && (
                <div
                  className="px-5 py-3 border-t"
                  style={{ borderColor: '#06B6D422' }}
                >
                  <span
                    className="text-xs uppercase tracking-widest font-semibold block mb-2"
                    style={{ color: '#06B6D4' }}
                  >
                    Sources
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map(source => (
                      <div
                        key={source.source_number}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                        style={{
                          background: '#06B6D410',
                          border: '1px solid #06B6D433',
                          color: '#06B6D4',
                        }}
                        title={source.content_preview}
                      >
                        <span className="font-medium">Source {source.source_number}</span>
                        <span className="text-muted-foreground">{Math.round(source.similarity_score * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setResult(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="mt-auto">
        <div
          className="rounded-xl border p-3 flex gap-3 items-end"
          style={{
            background: 'oklch(1 0 0 / 3%)',
            borderColor: '#06B6D433',
            backdropFilter: 'blur(12px)',
          }}
        >
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document..."
            rows={2}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed"
          />
          <motion.button
            onClick={handleQuery}
            disabled={!question.trim() || isLoading}
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
