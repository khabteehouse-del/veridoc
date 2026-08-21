import { Annotation } from "@langchain/langgraph"

export const AgentState = Annotation.Root({
  document_id: Annotation<string>(),
  document_name: Annotation<string>(),
  document_content: Annotation<string>(),
  extraction: Annotation<Record<string, unknown>>(),
  riskAnalysis: Annotation<Record<string, unknown>>(),
  summary: Annotation<Record<string, unknown>>(),
  conclusion: Annotation<string>(),
  citationsValid: Annotation<boolean>(),
  retryCount: Annotation<number>({
    reducer: (x, y) => y,
    default: () => 0,
  }),
})