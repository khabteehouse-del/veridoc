const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const HF_API_KEY = process.env.HF_API_KEY || ''

export async function generateEmbedding(text: string): Promise<number[]> {
  // Use Hugging Face in production, Ollama locally
  if (HF_API_KEY) {
    return generateEmbeddingHuggingFace(text)
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

async function generateEmbeddingHuggingFace(text: string): Promise<number[]> {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/nomic-ai/nomic-embed-text-v1',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text })
    }
  )

  if (!response.ok) {
    throw new Error(`HuggingFace embedding failed: ${response.statusText}`)
  }

  const data = await response.json()

  // HF returns nested array for sentence transformers
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0]
  }

  return data
}
