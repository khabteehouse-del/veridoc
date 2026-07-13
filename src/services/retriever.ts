import { supabase } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/ollama'
import { MatchedChunk } from '@/types'

export async function retrieveRelevantChunks(
  query: string,
  documentId?: string,
  matchCount: number = 5,
  matchThreshold: number = 0.3
): Promise<MatchedChunk[]> {
  const queryEmbedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: matchThreshold,
    match_count: matchCount,
    filter_doc_id: documentId || null
  })

  if (error) {
    throw new Error(`Retrieval failed: ${error.message}`)
  }

  return (data || []) as MatchedChunk[]
}