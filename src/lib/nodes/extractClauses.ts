// src/lib/nodes/extractClauses.ts
import { retrieveRelevantChunks } from '@/services/retriever'
import { generateCompletion } from '@/lib/groq'
import { AgentState } from '@/lib/agentState'


export async function extractClausesNode(state: typeof AgentState.State) {
  const extractionChunks = await retrieveRelevantChunks(
    'parties names dates obligations risks governing law payment terms termination confidentiality',
    state.document_id, 15, 0.1
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
    `Contract: ${state.document_name}\n\n${extractionContext}`
  )

  let extraction: Record<string, unknown> = {}
  try {
    extraction = JSON.parse(extractionResponse.replace(/```json|```/g, '').trim())
  } catch {
    extraction = {}
  }

  return { extraction }
}