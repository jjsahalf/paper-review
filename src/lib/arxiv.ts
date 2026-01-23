interface ArxivPaper {
  title: string
  authors: string[]
  abstract: string
  arxivId: string
  pdfUrl: string
  publishedAt: Date
  categories: string[]
}

export async function fetchArxivPaper(arxivId: string): Promise<ArxivPaper | null> {
  // Clean up the arxiv ID (remove version if present, and handle different formats)
  const cleanId = arxivId.replace(/^arxiv:/i, '').replace(/v\d+$/, '')

  const url = `https://export.arxiv.org/api/query?id_list=${cleanId}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch from arXiv: ${response.statusText}`)
    }

    const xmlText = await response.text()

    // Parse the XML response
    const entry = parseArxivXml(xmlText)
    if (!entry) {
      return null
    }

    return entry
  } catch (error) {
    console.error('Error fetching from arXiv:', error)
    return null
  }
}

function parseArxivXml(xmlText: string): ArxivPaper | null {
  // Simple XML parsing for arXiv API response
  const entryMatch = xmlText.match(/<entry>([\s\S]*?)<\/entry>/)
  if (!entryMatch) {
    return null
  }

  const entry = entryMatch[1]

  // Extract title
  const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/)
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : ''

  if (!title) {
    return null
  }

  // Extract authors
  const authorMatches = entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)
  const authors = Array.from(authorMatches).map(m => m[1].trim())

  // Extract abstract (summary)
  const abstractMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/)
  const abstract = abstractMatch ? abstractMatch[1].replace(/\s+/g, ' ').trim() : ''

  // Extract arxiv ID
  const idMatch = entry.match(/<id>http:\/\/arxiv\.org\/abs\/([\s\S]*?)<\/id>/)
  const arxivId = idMatch ? idMatch[1].trim() : ''

  // Extract PDF URL
  const pdfMatch = entry.match(/<link[^>]*title="pdf"[^>]*href="([^"]*)"/)
  const pdfUrl = pdfMatch ? pdfMatch[1].replace('http://', 'https://') : `https://arxiv.org/pdf/${arxivId}.pdf`

  // Extract published date
  const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/)
  const publishedAt = publishedMatch ? new Date(publishedMatch[1].trim()) : new Date()

  // Extract categories
  const categoryMatches = entry.matchAll(/<category[^>]*term="([^"]*)"/g)
  const categories = Array.from(categoryMatches).map(m => m[1])

  return {
    title,
    authors,
    abstract,
    arxivId,
    pdfUrl,
    publishedAt,
    categories,
  }
}
