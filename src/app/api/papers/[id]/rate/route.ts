import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { score, visitorId } = body

    if (!score || score < 1 || score > 5) {
      return NextResponse.json(
        { error: 'Score must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!visitorId) {
      return NextResponse.json(
        { error: 'Visitor ID is required' },
        { status: 400 }
      )
    }

    const paperId = params.id

    // Check if paper exists
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    // Upsert the rating (update if exists, create if not)
    const existingRating = await prisma.rating.findUnique({
      where: {
        paperId_visitorId: { paperId, visitorId },
      },
    })

    if (existingRating) {
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: { score },
      })
    } else {
      await prisma.rating.create({
        data: {
          paperId,
          score,
          visitorId,
        },
      })
    }

    // Recalculate average rating
    const ratings = await prisma.rating.findMany({
      where: { paperId },
    })

    const avgRating =
      ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
    const ratingCount = ratings.length

    await prisma.paper.update({
      where: { id: paperId },
      data: { avgRating, ratingCount },
    })

    return NextResponse.json({
      success: true,
      avgRating,
      ratingCount,
      userScore: score,
    })
  } catch (error) {
    console.error('Failed to rate paper:', error)
    return NextResponse.json({ error: 'Failed to rate paper' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const searchParams = request.nextUrl.searchParams
  const visitorId = searchParams.get('visitorId')

  if (!visitorId) {
    return NextResponse.json({ userScore: null })
  }

  try {
    const rating = await prisma.rating.findUnique({
      where: {
        paperId_visitorId: { paperId: params.id, visitorId },
      },
    })

    return NextResponse.json({ userScore: rating?.score || null })
  } catch (error) {
    console.error('Failed to fetch rating:', error)
    return NextResponse.json({ userScore: null })
  }
}
