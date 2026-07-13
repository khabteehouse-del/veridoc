'use client'

import { useEffect, useState } from 'react'
import DocumentPreview from '@/components/output/DocumentPreview'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Document {
  id: string
  name: string
  file_type: string
  size: number
  created_at: string
}

interface DocumentLibraryProps {
  onSelect: (doc: { document_id: string; document_name: string; chunks_created: number }) => void
  onUploadNew: () => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DocumentLibrary({ onSelect, onUploadNew }: DocumentLibraryProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [preview, setPreview] = useState<Document | null>(null)
  const [previewChunks, setPreviewChunks] = useState<number>(0)
  const [fullPreview, setFullPreview] = useState<Document | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents/list')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setDocuments(data.documents)
    } catch {
      toast.error('Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = async (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(doc)
    try {
      const response = await fetch(`/api/documents/chunks-count?document_id=${doc.id}`)
      const data = await response.json()
      setPreviewChunks(data.count || 0)
    } catch {
      setPreviewChunks(0)
    }
  }

  const handleOpen = async (doc: Document) => {
    setSelecting(doc.id)
    try {
      const response = await fetch(`/api/documents/chunks-count?document_id=${doc.id}`)
      const data = await response.json()
      onSelect({
        document_id: doc.id,
        document_name: doc.name,
        chunks_created: data.count || 0
      })
    } catch {
      onSelect({ document_id: doc.id, document_name: doc.name, chunks_created: 0 })
    } finally {
      setSelecting(null)
    }
  }

  const handleDelete = async (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return
    setDeleting(doc.id)
    try {
      const response = await fetch(`/api/documents/delete?document_id=${doc.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Delete failed')
      setDocuments(prev => prev.filter(d => d.id !== doc.id))
      if (preview?.id === doc.id) setPreview(null)
      toast.success(`${doc.name} deleted`)
    } catch {
      toast.error('Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Document Library</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {documents.length} document{documents.length !== 1 ? 's' : ''} ingested
          </p>
        </div>
        <motion.button
          onClick={onUploadNew}
          whileHover={{ scale: 1.02, boxShadow: '0 0 16px #06B6D444' }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ border: '1px solid #06B6D4', color: '#06B6D4', background: '#06B6D410' }}
        >
          + Upload New
        </motion.button>
      </div>

      <div className="flex gap-6">
        {/* Document list */}
        <div className="flex-1 space-y-3">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'oklch(1 0 0 / 5%)' }} />
            ))
          ) : documents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 space-y-3"
            >
              <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center"
                style={{ background: '#06B6D415', color: '#06B6D4' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">No documents yet</p>
              <button onClick={onUploadNew} className="text-xs" style={{ color: '#06B6D4' }}>
                Upload your first document →
              </button>
            </motion.div>
          ) : (
            documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={(e) => handlePreview(doc, e)}
                className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300"
                style={{
                  background: preview?.id === doc.id ? '#06B6D410' : 'oklch(1 0 0 / 3%)',
                  borderColor: preview?.id === doc.id ? '#06B6D4' : 'oklch(1 0 0 / 8%)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: preview?.id === doc.id ? '0 0 20px #06B6D433' : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#06B6D415', color: '#06B6D4' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatSize(doc.size)} · {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: '#06B6D410', color: '#06B6D4', border: '1px solid #06B6D430' }}>
                    {doc.file_type === 'application/pdf' ? 'PDF' : 'DOCX'}
                  </span>

                  {/* Delete button */}
                  <motion.button
                    onClick={(e) => handleDelete(doc, e)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={deleting === doc.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: '#ef444466' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#ef444466')}
                  >
                    {deleting === doc.id ? (
                      <div className="w-3 h-3 rounded-full border border-red-400 border-t-transparent animate-spin" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </motion.button>

                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#06B6D466' }}>
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Preview pane */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="w-72 flex-shrink-0"
            >
              <div
                className="rounded-xl border p-5 space-y-4 sticky top-8"
                style={{
                  background: 'oklch(1 0 0 / 3%)',
                  borderColor: '#06B6D444',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 0 20px #06B6D422',
                }}
              >
                {/* Corner brackets */}
                <div className="absolute top-2 left-2">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 5V1H5" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="absolute top-2 right-2">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 1H9V5" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="absolute bottom-2 left-2">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 5V9H5" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="absolute bottom-2 right-2">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 9H9V5" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: '#06B6D4' }}>
                    Document Preview
                  </p>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: '#06B6D415', color: '#06B6D4' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-foreground break-words">{preview.name}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/8">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-foreground">{preview.file_type === 'application/pdf' ? 'PDF' : 'DOCX'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Size</span>
                    <span className="text-foreground">{formatSize(preview.size)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Ingested</span>
                    <span className="text-foreground">{formatDate(preview.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Chunks</span>
                    <span style={{ color: '#06B6D4' }}>{previewChunks} embedded</span>
                  </div>
                </div>

                <motion.button
                  onClick={() => handleOpen(preview)}
                  disabled={selecting === preview.id}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px #06B6D455' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                    color: 'white',
                  }}
                >
                  {selecting === preview.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Opening...
                    </span>
                  ) : (
                    'Open Document →'
                  )}
                </motion.button>

                <button
                  onClick={() => setPreview(null)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close preview
                </button>

                <motion.button
                  onClick={() => setFullPreview(preview)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 rounded-lg text-xs font-medium"
                  style={{ border: '1px solid #06B6D433', color: '#06B6D4', background: '#06B6D408' }}
                >
                  👁 Preview Document Content
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen document preview */}
      {fullPreview && (
        <DocumentPreview
          documentId={fullPreview.id}
          documentName={fullPreview.name}
          onClose={() => setFullPreview(null)}
        />
      )}
    </div>
  )
}
