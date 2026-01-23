'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getVisitorId } from '@/lib/utils'

interface VoteButtonsProps {
  reviewId: string
  reviewType: 'short' | 'long'
  upvotes: number
  downvotes: number
}

export function VoteButtons({
  reviewId,
  reviewType,
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async (voteType: 'up' | 'down') => {
    if (isLoading) return

    const visitorId = getVisitorId()
    if (!visitorId) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewType,
          visitorId,
          voteType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUpvotes(data.upvotes)
        setDownvotes(data.downvotes)
        setUserVote(userVote === voteType ? null : voteType)
      }
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('up')}
        disabled={isLoading}
        className={cn(
          'gap-1',
          userVote === 'up' && 'text-primary-600 bg-primary-50'
        )}
      >
        <ThumbsUp className="w-4 h-4" />
        <span>{upvotes}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('down')}
        disabled={isLoading}
        className={cn(
          'gap-1',
          userVote === 'down' && 'text-red-600 bg-red-50'
        )}
      >
        <ThumbsDown className="w-4 h-4" />
        <span>{downvotes}</span>
      </Button>
    </div>
  )
}
