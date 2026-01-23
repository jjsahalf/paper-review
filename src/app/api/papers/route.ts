import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')

  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { authors: { contains: search } },
      { abstract: { contains: search } },
    ]
  }

  if (category) {
    where.categories = { contains: category }
  }

  let orderBy: Record<string, string> = { createdAt: 'desc' }

  if (sort === 'rating') {
    orderBy = { avgRating: 'desc' }
  } else if (sort === 'popular') {
    orderBy = { ratingCount: 'desc' }
  }

  try {
    const [papers, total] = await Promise.all([
      prisma.paper.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.paper.count({ where }),
    ])

    return NextResponse.json({
      papers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch papers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      authors,
      abstract,
      arxivId,
      pdfUrl,
      publishedAt,
      categories,
    } = body

    if (!title || !authors || !abstract) {
      return NextResponse.json(
        { error: 'Title, authors, and abstract are required' },
        { status: 400 }
      )
    }

    // Check for duplicate arXiv ID
    if (arxivId) {
      const existing = await prisma.paper.findUnique({
        where: { arxivId },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Paper with this arXiv ID already exists', paperId: existing.id },
          { status: 409 }
        )
      }
    }

    const paper = await prisma.paper.create({
      data: {
        title,
        authors: Array.isArray(authors) ? JSON.stringify(authors) : authors,
        abstract,
        arxivId: arxivId || null,
        pdfUrl: pdfUrl || null,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        categories: Array.isArray(categories)
          ? JSON.stringify(categories)
          : categories || '[]',
      },
    })

    return NextResponse.json(paper, { status: 201 })
  } catch (error) {
    console.error('Failed to create paper:', error)
    return NextResponse.json(
      { error: 'Failed to create paper' },
      { status: 500 }
    )
  }
}
