import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('id, name, file_type, size, created_at')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return NextResponse.json({ documents: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
