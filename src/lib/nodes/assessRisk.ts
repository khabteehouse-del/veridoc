// src/lib/nodes/assessRisk.ts
import { retrieveRelevantChunks } from '@/services/retriever'
import { generateCompletion } from '@/lib/groq'
import { AgentState } from '@/lib/agentState'

export async function assessRiskNode(state: typeof AgentState.State) {
  const riskChunks = await retrieveRelevantChunks(
    'risk liability penalty breach termination default dispute indemnification',
    state.document_id, 10, 0.1
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
    `Contract: ${state.document_name}\n\n${riskContext}`
  )

  let riskAnalysis: Record<string, unknown> = {}
  try {
    riskAnalysis = JSON.parse(riskResponse.replace(/```json|```/g, '').trim())
  } catch {
    riskAnalysis = {}
  }

  return { riskAnalysis }
}