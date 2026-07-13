import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('document_id')

    if (!documentId) {
      return NextResponse.json({ error: 'document_id required' }, { status: 400 })
    }

    const { count, error } = await supabase
      .from('chunks')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', documentId)

    if (error) throw new Error(error.message)

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to count chunks' },
      { status: 500 }
    )
  }
}
