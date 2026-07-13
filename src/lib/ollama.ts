import { ChatOllama } from '@langchain/ollama'

// Initialize Ollama for chat if needed elsewhere
export const ollama = new ChatOllama({
  baseUrl: process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434',
  model: 'llama3',
})

const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434'

async function generateEmbeddingOllama(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      prompt: text,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama embedding failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.embedding
}

// Switched from Hugging Face to Gemini API
async function generateEmbeddingHuggingFace(text: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: {
          parts: [{ text: text }]
        }
      })
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini embedding failed: ${err}`)
  }

  const data = await response.json()
  
  if (data.embedding && data.embedding.values) {
    return data.embedding.values
  }
  
  throw new Error('Unexpected Gemini response format')
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // Use Gemini/HF logic if either environment variable is present, otherwise fallback to local Ollama
  if (process.env.HF_API_KEY || process.env.GEMINI_API_KEY) {
    return generateEmbeddingHuggingFace(text)
  }
  return generateEmbeddingOllama(text)
}