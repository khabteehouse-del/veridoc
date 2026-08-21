// src/app/api/agent/review/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { compiledGraph } from '@/lib/graph'

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

    console.log('Starting graph invoke for document:', document_id)

    const result = await compiledGraph.invoke({
      document_id,
      document_name: document.name,
      document_content: document.content,
      extraction: {},
      riskAnalysis: {},
      summary: {},
      conclusion: '',
      citationsValid: false,
      retryCount: 0,
    })

    console.log('Graph invoke completed')

    return NextResponse.json({
      success: true,
      document_id,
      document_name: document.name,
      steps_completed: 4,
      report: {
        extraction: result.extraction,
        risk_analysis: result.riskAnalysis,
        summary: result.summary,
        conclusion: result.conclusion,
        citations_valid: result.citationsValid,
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