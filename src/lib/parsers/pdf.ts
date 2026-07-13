 
const pdfParse = require('pdf-parse/lib/pdf-parse.js')

export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content extracted from PDF')
    }

    return data.text
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}