'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/layout/Header'
import LandingPage from '@/components/layout/LandingPage'
import UploadZone from '@/components/upload/UploadZone'
import DocumentLibrary from '@/components/layout/DocumentLibrary'
import QueryInterface from '@/components/query/QueryInterface'
import SummaryView from '@/components/output/SummaryView'
import ExtractionView from '@/components/output/ExtractionView'
import AgentReview from '@/components/output/AgentReview'
import MultiDocQuery from '@/components/output/MultiDocQuery'

interface UploadedDocument {
  document_id: string
  document_name: string
  chunks_created: number
}

type ActiveTab = 'qa' | 'summary' | 'extract' | 'agent' | 'compare'
type AppView = 'landing' | 'library' | 'upload' | 'workspace'

export default function Home() {
  const [view, setView] = useState<AppView>('landing')
  const [document, setDocument] = useState<UploadedDocument | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('qa')
  const [hydrated, setHydrated] = useState(false)

  // Restore state from sessionStorage on load
  useEffect(() => {
    const savedView = sessionStorage.getItem('veridoc_view') as AppView | null
    const savedDoc = sessionStorage.getItem('veridoc_document')
    const savedTab = sessionStorage.getItem('veridoc_tab') as ActiveTab | null

    if (savedView && savedView !== 'landing') setView(savedView)
    if (savedDoc) setDocument(JSON.parse(savedDoc))
    if (savedTab) setActiveTab(savedTab)
    setHydrated(true)
  }, [])

  // Persist state to sessionStorage on change
  useEffect(() => {
    if (!hydrated) return
    sessionStorage.setItem('veridoc_view', view)
    if (document) sessionStorage.setItem('veridoc_document', JSON.stringify(document))
    else sessionStorage.removeItem('veridoc_document')
    sessionStorage.setItem('veridoc_tab', activeTab)
  }, [view, document, activeTab, hydrated])

  const tabs = [
    { id: 'qa' as ActiveTab, label: 'Q&A' },
    { id: 'summary' as ActiveTab, label: 'Summary' },
    { id: 'extract' as ActiveTab, label: 'Extract' },
    { id: 'agent' as ActiveTab, label: '⚡ Agent Review' },
    { id: 'compare' as ActiveTab, label: '⇄ Compare' },
  ]

  const handleUploadComplete = (doc: UploadedDocument) => {
    setDocument(doc)
    setView('workspace')
  }

  const handleDocumentSelect = (doc: UploadedDocument) => {
    setDocument(doc)
    setView('workspace')
  }

  if (!hydrated) return null

  if (view === 'landing') {
    return <LandingPage onLaunch={() => setView('library')} />
  }

  return (
    <main className="min-h-screen bg-background">
      <Header
        onNavigateHome={() => setView('landing')}
        onNavigateLibrary={() => setView('library')}
        currentView={view}
      />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <AnimatePresence mode="wait">

          {view === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DocumentLibrary
                onSelect={handleDocumentSelect}
                onUploadNew={() => setView('upload')}
              />
            </motion.div>
          )}

          {view === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto pt-8 space-y-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setView('library')}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  ← Back to library
                </button>
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Upload a Document</h1>
                <p className="text-sm text-muted-foreground">PDF and DOCX supported — processed and embedded locally</p>
              </div>
              <UploadZone onUploadComplete={handleUploadComplete} />
            </motion.div>
          )}

          {view === 'workspace' && document && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setView('library')}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Library
                  </button>
                  <span className="text-muted-foreground/30 text-xs">/</span>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: '#06B6D415', color: '#06B6D4' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{document.document_name}</p>
                      <p className="text-xs text-muted-foreground">{document.chunks_created} chunks embedded</p>
                    </div>
                  </div>
                </div>
                <motion.button
                  onClick={() => setView('upload')}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 12px #06B6D433' }}
                  whileTap={{ scale: 0.98 }}
                  className="text-xs px-3 py-1.5 rounded-lg glass"
                  style={{ border: '1px solid #06B6D444', color: '#06B6D4' }}
                >
                  ↑ Upload new
                </motion.button>
              </div>

              <div className="flex gap-1 p-1 glass rounded-xl border border-white/8 w-fit">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: '#06B6D415', border: '1px solid #06B6D444' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="glass rounded-2xl p-6 min-h-[600px]" style={{ border: '1px solid #06B6D422' }}>
                <AnimatePresence mode="wait">
                  {activeTab === 'qa' && (
                    <motion.div key="qa" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="h-full">
                      <QueryInterface documentId={document.document_id} documentName={document.document_name} />
                    </motion.div>
                  )}
                  {activeTab === 'summary' && (
                    <motion.div key="summary" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                      <SummaryView documentId={document.document_id} documentName={document.document_name} />
                    </motion.div>
                  )}
                  {activeTab === 'extract' && (
                    <motion.div key="extract" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                      <ExtractionView documentId={document.document_id} documentName={document.document_name} />
                    </motion.div>
                  )}
                  {activeTab === 'agent' && (
                    <motion.div key="agent" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                      <AgentReview documentId={document.document_id} documentName={document.document_name} />
                    </motion.div>
                  )}
                  {activeTab === 'compare' && (
                    <motion.div key="compare" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                      <MultiDocQuery />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  )
}
