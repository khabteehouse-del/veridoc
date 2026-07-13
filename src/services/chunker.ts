import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

export interface TextChunk {
  content: string
  chunk_index: number
  metadata: {
    char_start: number
    char_end: number
    chunk_size: number
  }
}

export async function chunkText(text: string): Promise<TextChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '. ', ' ', '']
  })

  const chunks = await splitter.createDocuments([text])

  return chunks.map((chunk, index) => ({
    content: chunk.pageContent.trim(),
    chunk_index: index,
    metadata: {
      char_start: chunk.metadata.loc?.lines?.from || 0,
      char_end: chunk.metadata.loc?.lines?.to || 0,
      chunk_size: chunk.pageContent.length
    }
  }))
}