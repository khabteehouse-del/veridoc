// src/lib/nodes/produceReport.ts
import { generateCompletion } from '@/lib/groq'
import { AgentState } from '@/lib/agentState'

export async function produceReportNode(state: typeof AgentState.State) {
  const conclusionResponse = await generateCompletion(
    `You are Veridoc, an enterprise contract review agent.
Write a professional contract review conclusion in 2-3 paragraphs.
Be specific, cite the parties and key terms. Be direct and professional.
Do not use markdown, bold, italics, or asterisks. Plain text only.`,
    `Contract: ${state.document_name}
Parties: ${JSON.stringify(state.extraction.parties || [])}
Risk Level: ${state.riskAnalysis.risk_level || 'Unknown'}
Key Obligations: ${JSON.stringify(state.extraction.key_obligations || [])}
Red Flags: ${JSON.stringify(state.riskAnalysis.red_flags || [])}
Write the final review conclusion.`
  )

  const conclusion = conclusionResponse.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')

  return { conclusion, retryCount: state.retryCount + 1 }
}

export function verifyCitationsNode(state: typeof AgentState.State) {
  const parties = (state.extraction.parties as string[]) || []
  const riskLevel = (state.riskAnalysis.risk_level as string) || ''
  const conclusion = state.conclusion || ''

  const partiesMatch = parties.length === 0 || parties.some(p => conclusion.includes(p))
  const riskMatch = riskLevel === '' || conclusion.toLowerCase().includes(riskLevel.toLowerCase()) ||
    !['low', 'medium', 'high'].some(r => r !== riskLevel.toLowerCase() && conclusion.toLowerCase().includes(r))

  const citationsValid = partiesMatch && riskMatch

  return { citationsValid }
}