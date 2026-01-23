import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paperId = searchParams.get('paperId')
  const type = searchParams.get('type') || 'short'
  const sort = searchParams.get('sort') || 'hot'

  if (!paperId) {
    return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 })
  }

  try {
    let orderBy: Record<string, string>

    if (sort === 'hot') {
      orderBy = { upvotes: 'desc' }
    } else {
      orderBy = { createdAt: 'desc' }
    }

    if (type === 'short') {
      const reviews = await prisma.shortReview.findMany({
        where: { paperId },
        orderBy,
      })
      return NextResponse.json(reviews)
    } else {
      const reviews = await prisma.longReview.findMany({
        where: { paperId },
        orderBy,
      })
      return NextResponse.json(reviews)
    }
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paperId, content, nickname, type, title } = body

    if (!paperId || !content || !nickname) {
      return NextResponse.json(
        { error: 'Paper ID, content, and nickname are required' },
        { status: 400 }
      )
    }

    // Check if paper exists
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    if (type === 'short') {
      if (content.length > 140) {
        return NextResponse.json(
          { error: 'Short review must be 140 characters or less' },
          { status: 400 }
        )
      }

      const review = await prisma.shortReview.create({
        data: {
          paperId,
          content,
          nickname,
        },
      })

      return NextResponse.json(review, { status: 201 })
    } else {
      if (!title) {
        return NextResponse.json(
          { error: 'Title is required for long reviews' },
          { status: 400 }
        )
      }

      const review = await prisma.longReview.create({
        data: {
          paperId,
          title,
          content,
          nickname,
        },
      })

      return NextResponse.json(review, { status: 201 })
    }
  } catch (error) {
    console.error('Failed to create review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
