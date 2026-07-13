import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/ollama'
import { parsePDF } from '@/lib/parsers/pdf'
import { parseDOCX } from '@/lib/parsers/docx'
import { chunkText } from '@/services/chunker'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and DOCX files are supported' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text based on file type
    let extractedText: string

    if (file.type === 'application/pdf') {
      extractedText = await parsePDF(buffer)
    } else {
      extractedText = await parseDOCX(buffer)
    }

    // Store document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        file_type: file.type,
        size: file.size,
        content: extractedText,
        metadata: { original_name: file.name }
      })
      .select()
      .single()

    if (docError || !document) {
      throw new Error(`Failed to store document: ${docError?.message}`)
    }

    // Chunk the extracted text
    const chunks = await chunkText(extractedText)

    // Generate embeddings and store chunks
    const chunkInserts = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await generateEmbedding(chunk.content)
        return {
          document_id: document.id,
          content: chunk.content,
          chunk_index: chunk.chunk_index,
          embedding: JSON.stringify(embedding),
          metadata: chunk.metadata
        }
      })
    )

    const { error: chunksError } = await supabase
      .from('chunks')
      .insert(chunkInserts)

    if (chunksError) {
      throw new Error(`Failed to store chunks: ${chunksError.message}`)
    }

    return NextResponse.json({
      success: true,
      document_id: document.id,
      document_name: document.name,
      chunks_created: chunks.length,
      message: `Document ingested successfully. ${chunks.length} chunks created and embedded.`
    })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ingestion failed' },
      { status: 500 }
    )
  }
}