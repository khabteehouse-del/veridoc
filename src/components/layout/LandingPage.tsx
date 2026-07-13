'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Header from '@/components/layout/Header'

interface LandingPageProps {
  onLaunch: () => void
}

const features = [
  {
    title: 'RAG-Powered Q&A',
    description: 'Ask questions in natural language. Get precise, citation-grounded answers from your documents.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Executive Summaries',
    description: 'Generate structured executive summaries with key points extracted automatically.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Structured Extraction',
    description: 'Extract parties, dates, obligations, risks, and governing law into clean structured JSON.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polyline points="16 18 22 12 16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="8 6 2 12 8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Zero Data Egress',
    description: 'All embedding generation runs locally via Ollama. Your documents never leave your environment.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Intent Routing',
    description: 'Automatic classification of your query into Q&A, summarization, or extraction workflows.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Vector Search',
    description: 'pgvector-powered semantic search retrieves the most relevant document sections instantly.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

const stats = [
  { value: 'Local', label: 'Embedding Model' },
  { value: 'pgvector', label: 'Vector Storage' },
  { value: 'LLaMA 3.3', label: 'Language Model' },
  { value: 'Zero', label: 'Data Egress' },
]

function LiveButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="relative px-8 py-3.5 rounded-xl text-sm font-semibold overflow-hidden tracking-wide"
      style={{
        background: hovered ? 'linear-gradient(135deg, #06B6D415, #3B82F615)' : 'transparent',
        border: '1px solid #06B6D4',
        color: '#06B6D4',
        boxShadow: hovered
          ? '0 0 30px #06B6D455, 0 0 60px #3B82F633, inset 0 0 20px #06B6D410'
          : '0 0 12px #06B6D433',
        transition: 'all 0.3s ease',
      }}
    >
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), #06B6D4, #3B82F6, rgba(255,255,255,0.5), transparent)',
        }}
        animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
      />
      {hovered && (
        <>
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{ boxShadow: ['inset 0 0 0px #06B6D400', 'inset 0 0 15px #06B6D444', 'inset 0 0 0px #06B6D400'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #06B6D466 0%, transparent 70%)' }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #3B82F666 0%, transparent 70%)' }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5, delay: 0.5 }}
          />
        </>
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

const featureTechDetails: Record<string, string[]> = {
  'RAG-Powered Q&A': ['pgvector similarity search', 'nomic-embed-text embeddings', 'Llama 3.3 70B via Groq', 'Citation-grounded responses'],
  'Executive Summaries': ['Top-10 chunk retrieval', 'Structured JSON output', 'Key point extraction', 'Document-grounded only'],
  'Structured Extraction': ['12-field JSON schema', 'Parties, dates, obligations', 'Risk identification', 'Governing law detection'],
  'Zero Data Egress': ['Ollama local embeddings', 'Air-gapped processing', 'No third-party data sharing', 'Enterprise compliant'],
  'Intent Routing': ['3-class classifier', 'Q&A / Summarize / Extract', 'Confidence scoring', 'Deterministic routing'],
  'Vector Search': ['pgvector cosine similarity', 'IVFFlat index', '768-dimension vectors', 'Threshold filtering'],
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [hovered, setHovered] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const techDetails = featureTechDetails[feature.title] || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.08 }}
      onAnimationComplete={() => setLoaded(true)}
      onHoverStart={() => loaded && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative cursor-default"
      style={{ perspective: '1000px', height: '190px' }}
    >
      <motion.div
        animate={{ rotateY: hovered ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl p-5 border"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: 'oklch(1 0 0 / 3%)',
            borderColor: 'oklch(1 0 0 / 8%)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
            style={{ background: '#06B6D415', color: '#06B6D4' }}
          >
            {feature.icon}
          </div>
          <h3 className="text-sm font-medium text-foreground mb-2">{feature.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl p-5 border"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, oklch(0.13 0 0), oklch(0.16 0.03 195))',
            borderColor: '#06B6D4',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 25px #06B6D455, 0 0 50px #3B82F620',
          }}
        >
          {/* Corner brackets */}
          <div className="absolute top-2 left-2">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 6V1H6" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="absolute top-2 right-2">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1H11V6" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="absolute bottom-2 left-2">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 6V11H6" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="absolute bottom-2 right-2">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 11H11V6" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <p className="text-xs font-semibold mb-3" style={{ color: '#06B6D4' }}>
            {feature.title}
          </p>
          <ul className="space-y-2">
            {techDetails.map((detail, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#06B6D4' }} />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.08 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -2, scale: 1.03 }}
      className="rounded-xl p-4 text-center border cursor-default relative overflow-hidden"
      style={{
        background: hovered ? 'linear-gradient(135deg, oklch(0.13 0 0), oklch(0.15 0.02 195))' : 'oklch(1 0 0 / 3%)',
        boxShadow: hovered ? '0 0 25px #06B6D488, 0 0 50px #3B82F618' : 'none',
        borderColor: hovered ? '#06B6D4' : 'oklch(1 0 0 / 8%)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease',
      }}
    >
      <motion.p
        className="text-lg font-semibold"
        style={{ color: '#06B6D4' }}
        animate={hovered ? { scale: 1.05 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        {stat.value}
      </motion.p>
      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
    </motion.div>
  )
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none opacity-10"
        style={{
          background: 'radial-gradient(ellipse at center, #06B6D4 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Single shared Header */}
      <Header
        onNavigateHome={() => {}}
        onNavigateLibrary={onLaunch}
        currentView="landing"
      />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16">

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative w-full max-w-3xl mx-auto mb-8 rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 0 80px #06B6D444, 0 0 120px #3B82F622, 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <Image
            src="/hero.png"
            alt="Veridoc"
            width={1400}
            height={787}
            className="w-full h-auto"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
        </motion.div>

        {/* Heading + CTA below hero */}
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.8rem)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              background: 'linear-gradient(90deg, #ffffff, #06B6D4, #ffffff, #3B82F6, #ffffff)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 14s linear infinite',
            }}
          >
            Understand any contract in seconds.
          </motion.h1>
          <style>{`
            @keyframes shimmer {
              0% { background-position: 0% 50% }
              100% { background-position: 300% 50% }
            }
          `}</style>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Upload a contract. Ask questions in plain English. Extract structured data.
            Get citation-grounded answers — all without a single byte leaving your environment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-4 pt-1"
          >
            <LiveButton onClick={onLaunch}>Launch Veridoc</LiveButton>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              Zero data egress
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Everything you need to analyze contracts
          </h2>
          <p className="text-sm text-muted-foreground">
            Built on a production-grade RAG architecture with local embedding generation.
          </p>
        </motion.div>
        <div className="grid grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/8 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Veridoc</span>
            <span className="text-xs text-muted-foreground/40">—</span>
            <span className="text-xs text-muted-foreground/60">Enterprise Document Intelligence</span>
          </div>
          <span className="text-xs text-muted-foreground/40">Built by Faraz</span>
        </div>
      </footer>
    </main>
  )
}
