const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''

export async function generateEmbedding(text: string): Promise<number[]> {
  if (GOOGLE_API_KEY) {
    return generateEmbeddingGoogle(text)
  }
  return generateEmbeddingOllama(text)
}

async function generateEmbeddingOllama(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      prompt: text
    })
  })

  if (!response.ok) {
    throw new Error(`Ollama embedding failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.embedding
}

async function generateEmbeddingGoogle(text: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: {
          parts: [{ text }]
        },
        outputDimensionality: 768
      })
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Google embedding failed: ${err}`)
  }

  const data = await response.json()
  return data.embedding.values
}
