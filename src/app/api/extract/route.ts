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
      'parties names dates obligations risks governing law payment terms termination confidentiality',
      document_id,
      15,
      0.1
    )

    const context = chunks
      .map((chunk, index) => `[Section ${index + 1}]\n${chunk.content}`)
      .join('\n\n')

    const systemPrompt = `You are Veridoc, an enterprise contract intelligence assistant.
Extract structured data from the provided contract sections.

Respond with valid JSON only. No markdown. No explanation.
Use null for any field not found in the document.

Required format:
{
  "document_type": "string",
  "parties": ["string"],
  "effective_date": "YYYY-MM-DD or null",
  "expiry_date": "YYYY-MM-DD or null",
  "contract_value": "string or null",
  "governing_law": "string or null",
  "payment_terms": "string or null",
  "notice_period": "string or null",
  "key_obligations": ["string"],
  "identified_risks": ["string"],
  "termination_conditions": ["string"],
  "confidentiality_clause_present": true or false
}`

    const userPrompt = `Contract document: ${document.name}

Contract sections:
${context}

Extract all available structured data from this contract.`

    const response = await generateCompletion(systemPrompt, userPrompt)
    const cleaned = response.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json({
      success: true,
      document_id,
      document_name: document.name,
      extraction: parsed
    })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Extraction failed' },
      { status: 500 }
    )
  }
}