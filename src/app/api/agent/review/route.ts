import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateCompletion } from '@/lib/groq'
import { retrieveRelevantChunks } from '@/services/retriever'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { document_id } = body

    if (!document_id) {
      return NextResponse.json({ error: 'document_id required' }, { status: 400 })
    }

    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('name, content')
      .eq('id', document_id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Step 1 — Structured Extraction
    const extractionChunks = await retrieveRelevantChunks(
      'parties names dates obligations risks governing law payment terms termination confidentiality',
      document_id, 15, 0.1
    )
    const extractionContext = extractionChunks.map((c, i) => `[Section ${i + 1}]\n${c.content}`).join('\n\n')
    const extractionResponse = await generateCompletion(
      `You are Veridoc, an enterprise contract intelligence assistant.
Extract structured data from the contract. Respond with valid JSON only. No markdown.
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
}`,
      `Contract: ${document.name}\n\n${extractionContext}`
    )
    let extraction: Record<string, unknown> = {}
    try { extraction = JSON.parse(extractionResponse.replace(/```json|```/g, '').trim()) } catch { extraction = {} }

    // Step 2 — Risk Analysis
    const riskChunks = await retrieveRelevantChunks(
      'risk liability penalty breach termination default dispute indemnification',
      document_id, 10, 0.1
    )
    const riskContext = riskChunks.map((c, i) => `[Section ${i + 1}]\n${c.content}`).join('\n\n')
    const riskResponse = await generateCompletion(
      `You are Veridoc, an enterprise contract risk analyst.
Analyze the contract for risks and red flags. Respond with valid JSON only. No markdown.
Format:
{
  "risk_level": "Low | Medium | High",
  "risk_summary": "2-3 sentence overview",
  "red_flags": ["string"],
  "recommendations": ["string"]
}`,
      `Contract: ${document.name}\n\n${riskContext}`
    )
    let riskAnalysis: Record<string, unknown> = {}
    try { riskAnalysis = JSON.parse(riskResponse.replace(/```json|```/g, '').trim()) } catch { riskAnalysis = {} }

    // Step 3 — Executive Summary
    const summaryChunks = await retrieveRelevantChunks(
      'summary overview purpose scope agreement terms conditions',
      document_id, 10, 0.1
    )
    const summaryContext = summaryChunks.map((c, i) => `[Section ${i + 1}]\n${c.content}`).join('\n\n')
    const summaryResponse = await generateCompletion(
      `You are Veridoc, an enterprise document intelligence assistant.
Produce a professional executive summary. Respond with valid JSON only. No markdown.
Format:
{
  "summary": "3-4 paragraph executive summary",
  "key_points": ["string"]
}`,
      `Contract: ${document.name}\n\n${summaryContext}`
    )
    let summary: Record<string, unknown> = {}
    try { summary = JSON.parse(summaryResponse.replace(/```json|```/g, '').trim()) } catch { summary = {} }

    // Step 4 — Conclusion
    const conclusionResponse = await generateCompletion(
      `You are Veridoc, an enterprise contract review agent.
Write a professional contract review conclusion in 2-3 paragraphs.
Be specific, cite the parties and key terms. Be direct and professional.
Do not use markdown, bold, italics, or asterisks. Plain text only.`,
      `Contract: ${document.name}
Parties: ${JSON.stringify(extraction.parties || [])}
Risk Level: ${riskAnalysis.risk_level || 'Unknown'}
Key Obligations: ${JSON.stringify(extraction.key_obligations || [])}
Red Flags: ${JSON.stringify(riskAnalysis.red_flags || [])}
Write the final review conclusion.`
    )

    return NextResponse.json({
      success: true,
      document_id,
      document_name: document.name,
      steps_completed: 4,
      report: {
        extraction,
        risk_analysis: riskAnalysis,
        summary,
        conclusion: conclusionResponse.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'),
        reviewed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Agent review failed' },
      { status: 500 }
    )
  }
}
