import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { reviewType, visitorId, voteType } = body
    const reviewId = params.id

    if (!visitorId || !voteType || !reviewType) {
      return NextResponse.json(
        { error: 'Visitor ID, vote type, and review type are required' },
        { status: 400 }
      )
    }

    if (voteType !== 'up' && voteType !== 'down') {
      return NextResponse.json(
        { error: 'Vote type must be "up" or "down"' },
        { status: 400 }
      )
    }

    if (reviewType !== 'short' && reviewType !== 'long') {
      return NextResponse.json(
        { error: 'Review type must be "short" or "long"' },
        { status: 400 }
      )
    }

    // Check if review exists
    if (reviewType === 'short') {
      const review = await prisma.shortReview.findUnique({
        where: { id: reviewId },
      })
      if (!review) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        )
      }
    } else {
      const review = await prisma.longReview.findUnique({
        where: { id: reviewId },
      })
      if (!review) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        )
      }
    }

    // Find existing vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        visitorId,
        ...(reviewType === 'short'
          ? { shortReviewId: reviewId }
          : { longReviewId: reviewId }),
      },
    })

    let upvoteDelta = 0
    let downvoteDelta = 0

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote (toggle off)
        await prisma.vote.delete({
          where: { id: existingVote.id },
        })
        if (voteType === 'up') {
          upvoteDelta = -1
        } else {
          downvoteDelta = -1
        }
      } else {
        // Change vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { voteType },
        })
        if (voteType === 'up') {
          upvoteDelta = 1
          downvoteDelta = -1
        } else {
          upvoteDelta = -1
          downvoteDelta = 1
        }
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          reviewType,
          visitorId,
          voteType,
          ...(reviewType === 'short'
            ? { shortReviewId: reviewId }
            : { longReviewId: reviewId }),
        },
      })
      if (voteType === 'up') {
        upvoteDelta = 1
      } else {
        downvoteDelta = 1
      }
    }

    // Update review vote counts
    let updatedReview
    if (reviewType === 'short') {
      updatedReview = await prisma.shortReview.update({
        where: { id: reviewId },
        data: {
          upvotes: { increment: upvoteDelta },
          downvotes: { increment: downvoteDelta },
        },
      })
    } else {
      updatedReview = await prisma.longReview.update({
        where: { id: reviewId },
        data: {
          upvotes: { increment: upvoteDelta },
          downvotes: { increment: downvoteDelta },
        },
      })
    }

    return NextResponse.json({
      success: true,
      upvotes: updatedReview.upvotes,
      downvotes: updatedReview.downvotes,
    })
  } catch (error) {
    console.error('Failed to vote:', error)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
