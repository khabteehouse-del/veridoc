import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateCompletion } from '@/lib/groq'
import { retrieveRelevantChunks } from '@/services/retriever'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { document_id } = body

    if (!document_id) {
      return NextResponse.json(
        { error: 'document_id is required' },
        { status: 400 }
      )
    }

    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('name, content')
      .eq('id', document_id)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const chunks = await retrieveRelevantChunks(
      'summarize overview key points main topics',
      document_id,
      10,
      0.1
    )

    const context = chunks
      .map((chunk, index) => `[Section ${index + 1}]\n${chunk.content}`)
      .join('\n\n')

    const systemPrompt = `You are Veridoc, an enterprise document intelligence assistant.
Your task is to produce a professional summary of the provided document.

Format your response as valid JSON only. No markdown. No explanation.
Format:
{
  "summary": "2-3 paragraph executive summary",
  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"]
}`

    const userPrompt = `Document name: ${document.name}

Document sections:
${context}

Produce a professional executive summary with key points.`

    const response = await generateCompletion(systemPrompt, userPrompt)
    const cleaned = response.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json({
      success: true,
      document_id,
      document_name: document.name,
      summary: parsed.summary,
      key_points: parsed.key_points
    })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Summarization failed' },
      { status: 500 }
    )
  }
}