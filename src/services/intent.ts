import { generateCompletion } from '@/lib/groq'
import { IntentClassification, IntentType } from '@/types'

export async function classifyIntent(
  query: string
): Promise<IntentClassification> {
  const systemPrompt = `You are an intent classifier for an enterprise document intelligence system.
Classify the user query into exactly one of these intents:

- qa: The user wants to ask a specific question about the document
- summarize: The user wants a summary or overview of the document
- extract: The user wants structured data extracted from the document

Respond with valid JSON only. No explanation. No markdown.
Format: {"intent": "qa|summarize|extract", "confidence": 0.0-1.0, "reasoning": "one sentence"}`

  const userPrompt = `Classify this query: "${query}"`

  const response = await generateCompletion(systemPrompt, userPrompt)

  try {
    const cleaned = response.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    const validIntents: IntentType[] = ['qa', 'summarize', 'extract']
    if (!validIntents.includes(parsed.intent)) {
      return {
        intent: 'qa',
        confidence: 0.5,
        reasoning: 'Defaulted to Q&A due to unclear intent'
      }
    }

    return parsed as IntentClassification
  } catch {
    return {
      intent: 'qa',
      confidence: 0.5,
      reasoning: 'Defaulted to Q&A due to parsing error'
    }
  }
}