'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface UploadedDocument {
  document_id: string
  document_name: string
  chunks_created: number
}

interface UploadZoneProps {
  onUploadComplete: (doc: UploadedDocument) => void
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')

  const uploadFile = useCallback(async (file: File) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowed.includes(file.type)) {
      toast.error('Only PDF and DOCX files are supported')
      return
    }

    setIsUploading(true)
    setProgress(10)
    setStage('Reading document...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      setProgress(30)
      setStage('Extracting text...')

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      setProgress(60)
      setStage('Generating embeddings...')

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setProgress(90)
      setStage('Storing vectors...')

      await new Promise(r => setTimeout(r, 500))

      setProgress(100)
      setStage('Complete')

      toast.success(`${file.name} ingested successfully — ${data.chunks_created} chunks embedded`)
      onUploadComplete(data)

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setProgress(0)
        setStage('')
      }, 1000)
    }
  }, [onUploadComplete])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }, [uploadFile])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div className="w-full">
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? 'oklch(0.606 0.243 293.5)' : 'oklch(1 0 0 / 8%)',
          backgroundColor: isDragging ? 'oklch(0.606 0.243 293.5 / 5%)' : 'oklch(1 0 0 / 2%)',
        }}
        transition={{ duration: 0.2 }}
        className="relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer"
      >
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">{stage}</p>
              <div className="w-full max-w-xs mx-auto bg-secondary rounded-full h-1.5">
                <motion.div
                  className="h-1.5 rounded-full bg-primary"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <motion.div
                className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center"
                animate={{ y: isDragging ? -4 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="oklch(0.606 0.243 293.5)" strokeWidth="2" strokeLinejoin="round" />
                  <polyline points="14 2 14 8 20 8" stroke="oklch(0.606 0.243 293.5)" strokeWidth="2" strokeLinejoin="round" />
                  <line x1="12" y1="18" x2="12" y2="12" stroke="oklch(0.606 0.243 293.5)" strokeWidth="2" strokeLinecap="round" />
                  <polyline points="9 15 12 12 15 15" stroke="oklch(0.606 0.243 293.5)" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </motion.div>
              <div>
                <p className="text-base font-medium text-foreground">
                  {isDragging ? 'Drop to upload' : 'Upload a document'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Drag and drop or click to browse</p>
                <p className="text-xs text-muted-foreground mt-2">PDF and DOCX supported</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
