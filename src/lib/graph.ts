// src/lib/graph.ts
import { StateGraph, END } from '@langchain/langgraph'
import { AgentState } from '@/lib/agentState'
import { extractClausesNode } from '@/lib/nodes/extractClauses'
import { assessRiskNode } from '@/lib/nodes/assessRisk'
import { generateSummaryNode } from '@/lib/nodes/generateSummary'
import { produceReportNode, verifyCitationsNode } from '@/lib/nodes/produceReport'

const MAX_RETRIES = 2

function routeAfterVerification(state: typeof AgentState.State) {
  if (state.citationsValid) return END
  if (state.retryCount >= MAX_RETRIES) return END
  return 'produceReport'
}

const graph = new StateGraph(AgentState)
  .addNode('extractClauses', extractClausesNode)
  .addNode('assessRisk', assessRiskNode)
  .addNode('generateSummary', generateSummaryNode)
  .addNode('produceReport', produceReportNode)
  .addNode('verifyCitations', verifyCitationsNode)
  .addEdge('__start__', 'extractClauses')
  .addEdge('extractClauses', 'assessRisk')
  .addEdge('assessRisk', 'generateSummary')
  .addEdge('generateSummary', 'produceReport')
  .addEdge('produceReport', 'verifyCitations')
  .addConditionalEdges('verifyCitations', routeAfterVerification)

export const compiledGraph = graph.compile()