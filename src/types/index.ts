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
  similarity: number
}

export interface QueryResult {
  answer: string
  chunks: MatchedChunk[]
  document_id: string
}

export interface ExtractionResult {
  document_type: string
  parties: string[]
  effective_date: string | null
  expiry_date: string | null
  contract_value: string | null
  governing_law: string
  payment_terms: string | null
  notice_period: string | null
  key_obligations: string[]
  identified_risks: string[]
  termination_conditions: string[]
  confidentiality_clause_present: boolean
}

export interface SummaryResult {
  summary: string
  key_points: string[]
  document_id: string
}

export type IntentType = 'qa' | 'summarize' | 'extract'

export interface IntentClassification {
  intent: IntentType
  confidence: number
  reasoning: string
}
