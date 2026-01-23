'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RatingStars } from '@/components/RatingStars'
import { ShortReviewForm } from '@/components/ShortReviewForm'
import { ShortReviewList } from '@/components/ShortReviewList'
import { LongReviewCard } from '@/components/LongReviewCard'
import { parseAuthors, parseCategories, formatDate, getVisitorId } from '@/lib/utils'
import { ExternalLink, FileText, ArrowLeft } from 'lucide-react'

interface Paper {
  id: string
  title: string
  authors: string
  abstract: string
  arxivId?: string | null
  pdfUrl?: string | null
  publishedAt?: string | null
  categories: string
  avgRating: number
  ratingCount: number
  createdAt: string
  longReviews: Array<{
    id: string
    title: string
    content: string
    nickname: string
    upvotes: number
    downvotes: number
    createdAt: string
  }>
}

export default function PaperDetailPage() {
  const params = useParams()
  const paperId = params.id as string

  const [paper, setPaper] = useState<Paper | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [refreshReviews, setRefreshReviews] = useState(0)

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const response = await fetch(`/api/papers/${paperId}`)
        if (response.ok) {
          const data = await response.json()
          setPaper(data)
        }
      } catch (error) {
        console.error('Failed to fetch paper:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchUserRating = async () => {
      const visitorId = getVisitorId()
      if (!visitorId) return

      try {
        const response = await fetch(
          `/api/papers/${paperId}/rate?visitorId=${visitorId}`
        )
        if (response.ok) {
          const data = await response.json()
          setUserRating(data.userScore)
        }
      } catch (error) {
        console.error('Failed to fetch user rating:', error)
      }
    }

    fetchPaper()
    fetchUserRating()
  }, [paperId])

  const handleRate = async (score: number) => {
    const visitorId = getVisitorId()
    if (!visitorId) return

    try {
      const response = await fetch(`/api/papers/${paperId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score, visitorId }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserRating(score)
        setPaper((prev) =>
          prev
            ? {
                ...prev,
                avgRating: data.avgRating,
                ratingCount: data.ratingCount,
              }
            : null
        )
      }
    } catch (error) {
      console.error('Failed to rate:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">论文不存在</h1>
        <Link href="/">
          <Button>返回首页</Button>
        </Link>
      </div>
    )
  }

  const authors = parseAuthors(paper.authors)
  const categories = parseCategories(paper.categories)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </Link>

      {/* Paper header */}
      <Card>
        <CardHeader>
          <div className="flex gap-2 flex-wrap mb-2">
            {categories.map((category) => (
              <Badge key={category}>{category}</Badge>
            ))}
          </div>
          <CardTitle className="text-2xl">{paper.title}</CardTitle>
          <p className="text-gray-600">{authors.join(', ')}</p>
          {paper.publishedAt && (
            <p className="text-sm text-gray-500">
              发表于 {formatDate(paper.publishedAt)}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">摘要</h3>
            <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {paper.arxivId && (
              <a
                href={`https://arxiv.org/abs/${paper.arxivId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="w-4 h-4" />
                arXiv:{paper.arxivId}
              </a>
            )}
            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <FileText className="w-4 h-4" />
                查看 PDF
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rating section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">评分</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">平均评分</p>
              <RatingStars
                rating={paper.avgRating}
                readonly
                size="lg"
                showScore
                ratingCount={paper.ratingCount}
              />
            </div>
            <div className="border-l border-gray-200 pl-6">
              <p className="text-sm text-gray-500 mb-1">
                {userRating ? '你的评分' : '给这篇论文评分'}
              </p>
              <RatingStars
                rating={userRating || 0}
                onRate={handleRate}
                size="lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Short reviews section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">短评</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ShortReviewForm
            paperId={paperId}
            onSuccess={() => setRefreshReviews((r) => r + 1)}
          />
          <div className="border-t border-gray-100 pt-4">
            <ShortReviewList paperId={paperId} refreshTrigger={refreshReviews} />
          </div>
        </CardContent>
      </Card>

      {/* Long reviews section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">长评</CardTitle>
          <Link href={`/paper/${paperId}/review/new`}>
            <Button variant="outline">写长评</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {paper.longReviews.length > 0 ? (
            <div className="space-y-4">
              {paper.longReviews.map((review) => (
                <LongReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              暂无长评，来写第一篇吧！
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
