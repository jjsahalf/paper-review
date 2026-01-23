'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating?: number
  onRate?: (score: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
  ratingCount?: number
}

export function RatingStars({
  rating = 0,
  onRate,
  readonly = false,
  size = 'md',
  showScore = false,
  ratingCount,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex items-center gap-2">
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onRate?.(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={cn(
              'p-0.5',
              readonly ? 'cursor-default' : 'cursor-pointer'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          </button>
        ))}
      </div>
      {showScore && rating > 0 && (
        <span className="text-lg font-semibold text-primary-600">
          {rating.toFixed(1)}
        </span>
      )}
      {ratingCount !== undefined && (
        <span className="text-sm text-gray-500">
          ({ratingCount}人评分)
        </span>
      )}
    </div>
  )
}
