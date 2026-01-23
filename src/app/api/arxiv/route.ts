import { NextRequest, NextResponse } from 'next/server'
import { fetchArxivPaper } from '@/lib/arxiv'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const arxivId = searchParams.get('id')

  if (!arxivId) {
    return NextResponse.json(
      { error: 'arXiv ID is required' },
      { status: 400 }
    )
  }

  try {
    const paper = await fetchArxivPaper(arxivId)

    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found on arXiv' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      arxivId: paper.arxivId,
      pdfUrl: paper.pdfUrl,
      publishedAt: paper.publishedAt.toISOString(),
      categories: paper.categories,
    })
  } catch (error) {
    console.error('Failed to fetch from arXiv:', error)
    return NextResponse.json(
      { error: 'Failed to fetch paper from arXiv' },
      { status: 500 }
    )
  }
}
