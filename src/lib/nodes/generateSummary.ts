// src/lib/nodes/generateSummary.ts
import { retrieveRelevantChunks } from '@/services/retriever'
import { generateCompletion } from '@/lib/groq'
import { AgentState } from '@/lib/agentState'

export async function generateSummaryNode(state: typeof AgentState.State) {
  const summaryChunks = await retrieveRelevantChunks(
    'summary overview purpose scope agreement terms conditions',
    state.document_id, 10, 0.1
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
    `Contract: ${state.document_name}\n\n${summaryContext}`
  )

  let summary: Record<string, unknown> = {}
  try {
    summary = JSON.parse(summaryResponse.replace(/```json|```/g, '').trim())
  } catch {
    summary = {}
  }

  return { summary }
}