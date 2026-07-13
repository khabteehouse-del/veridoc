import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('document_id')

    if (!documentId) {
      return NextResponse.json({ error: 'document_id required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('documents')
      .select('content, name')
      .eq('id', documentId)
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ content: data?.content || '', name: data?.name || '' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
