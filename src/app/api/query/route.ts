import { NextRequest, NextResponse } from 'next/server'
import { queryDocument } from '@/services/rag'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, document_id } = body

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const result = await queryDocument(question, document_id)

    return NextResponse.json({
      success: true,
      question,
      answer: result.answer,
      sources: result.chunks.map((chunk, index) => ({
        source_number: index + 1,
        content_preview: chunk.content.substring(0, 150) + '...',
        similarity_score: chunk.similarity,
        chunk_index: chunk.chunk_index
      })),
      total_sources: result.chunks.length
    })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Query failed' },
      { status: 500 }
    )
  }
}