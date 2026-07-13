import Groq from 'groq-sdk'

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY!
})

if (!process.env.GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY environment variable')
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const completion = await groqClient.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1,
    max_tokens: 2048
  })

  return completion.choices[0]?.message?.content || ''
}

export { groqClient }