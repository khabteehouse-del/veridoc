export interface Document {
  id: string
  name: string
  file_type: string
  size: number
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface Chunk {
  id: string
  document_id: string
  content: string
  chunk_index: number
  metadata: Record<string, unknown>
  created_at: string
}

export interface MatchedChunk {
  id: string
  document_id: string
  content: string
  chunk_index: number
  metadata: Record<string, unknown>