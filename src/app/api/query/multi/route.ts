import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateCompletion } from '@/lib/groq'
import { generateEmbedding } from '@/lib/ollama'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, document_ids } = body

    if (!question || !document_ids || document_ids.length < 2) {
      return NextResponse.json(
        { error: 'A question and at least 2 document IDs are required' },
        { status: 400 }
      )
    }

    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id, name')
      .in('id', document_ids)

    if (docError || !documents) {
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    const queryEmbedding = await generateEmbedding(question)

    const documentContexts = await Promise.all(
      documents.map(async (doc) => {
        const { data: chunks } = await supabase.rpc('match_chunks', {
          query_embedding: JSON.stringify(queryEmbedding),
          match_threshold: 0.2,
          match_count: 5,
          filter_doc_id: doc.id
        })

        const context = (chunks || [])
          .map((c: { content: string }, i: number) => `[${doc.name} — Section ${i + 1}]\n${c.content}`)
          .join('\n\n')

        return { doc_id: doc.id, doc_name: doc.name, context, chunk_count: (chunks || []).length }
      })
    )

    const fullContext = documentContexts
      .map(d => `=== ${d.doc_name} ===\n${d.context || 'No relevant sections found.'}`)
      .join('\n\n')

    const systemPrompt = `You are Veridoc, an enterprise document intelligence assistant specializing in multi-document comparison.
You have been provided with content from ${documents.length} different documents.

Structure your response exactly like this:

DOCUMENT 1: [Document Name]
[Key findings from this document relevant to the question]

DOCUMENT 2: [Document Name]
[Key findings from this document relevant to the question]

COMPARISON SUMMARY:
[Direct comparison highlighting similarities and differences]

Rules:
- Be precise and professional
- Only use information from the provided context
- Keep each section focused and clear
- Do not use markdown bold or asterisks`

    const userPrompt = `Documents provided:
${documents.map(d => `- ${d.name}`).join('\n')}

Context from all documents:
${fullContext}

Question: ${question}

Provide a comparative analysis across all documents. Cite document names clearly.`

    const answer = await generateCompletion(systemPrompt, userPrompt)

    return NextResponse.json({
      success: true,
      question,
      answer,
      documents: documentContexts.map(d => ({
        document_id: d.doc_id,
        document_name: d.doc_name,
        chunks_used: d.chunk_count
      }))
    })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Multi-document query failed' },
      { status: 500 }
    )
  }
}
