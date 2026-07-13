import { generateCompletion } from '@/lib/groq'
import { retrieveRelevantChunks } from './retriever'
import { QueryResult, MatchedChunk } from '@/types'

export async function queryDocument(
  question: string,
  documentId?: string
): Promise<QueryResult> {
  const chunks = await retrieveRelevantChunks(question, documentId)

  if (chunks.length === 0) {
    return {
      answer: 'I could not find relevant information in the provided documents to answer this question.',
      chunks: [],
      document_id: documentId || ''
    }
  }

  const context = chunks
    .map((chunk: MatchedChunk, index: number) => 
      `[Source ${index + 1}]\n${chunk.content}`
    )
    .join('\n\n')

  const systemPrompt = `You are Veridoc, an enterprise document intelligence assistant.
Your role is to answer questions based strictly on the provided document context.

Rules:
- Only use information from the provided context
- Always cite your sources using [Source N] notation
- If the answer is not in the context, say so clearly
- Be precise and professional
- Do not hallucinate or invent information`

  const userPrompt = `Context from document:
${context}

Question: ${question}

Provide a precise answer based only on the context above. Cite sources.`

  const answer = await generateCompletion(systemPrompt, userPrompt)

  return {
    answer,
    chunks,
    document_id: documentId || ''
  }
}