'use client'

import { useState, useEffect } from 'react'
import { VoteButtons } from '@/components/VoteButtons'
import { formatDate } from '@/lib/utils'

interface ShortReview {
  id: string
  content: string
  nickname: string
  upvotes: number
  downvotes: number
  createdAt: string
}

interface ShortReviewListProps {
  paperId: string
  refreshTrigger?: number
}

export function ShortReviewList({ paperId, refreshTrigger }: ShortReviewListProps) {
  const [reviews, setReviews] = useState<ShortReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'hot' | 'new'>('hot')

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/reviews?paperId=${paperId}&type=short&sort=${sortBy}`
        )
        if (response.ok) {
          const data = await response.json()
          setReviews(data)
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [paperId, sortBy, refreshTrigger])

  if (isLoading) {
    return <div className="py-4 text-center text-gray-500">加载中...</div>
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        暂无短评，来写第一条吧！
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy('hot')}
          className={`px-3 py-1 text-sm rounded ${
            sortBy === 'hot'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          热门
        </button>
        <button
          onClick={() => setSortBy('new')}
          className={`px-3 py-1 text-sm rounded ${
            sortBy === 'new'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          最新
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {reviews.map((review) => (
          <div key={review.id} className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{review.nickname}</span>
              <span className="text-xs text-gray-400">
                {formatDate(review.createdAt)}
              </span>
            </div>
            <p className="text-gray-700 mb-2">{review.content}</p>
            <VoteButtons
              reviewId={review.id}
              reviewType="short"
              upvotes={review.upvotes}
              downvotes={review.downvotes}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
