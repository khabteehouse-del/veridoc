import mammoth from 'mammoth'

export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })

    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content extracted from DOCX')
    }

    return result.value
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}