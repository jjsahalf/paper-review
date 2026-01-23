import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: params.id },
      include: {
        shortReviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        longReviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    return NextResponse.json(paper)
  } catch (error) {
    console.error('Failed to fetch paper:', error)
    return NextResponse.json(
      { error: 'Failed to fetch paper' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.paper.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete paper:', error)
    return NextResponse.json(
      { error: 'Failed to delete paper' },
      { status: 500 }
    )
  }
}
