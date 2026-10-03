'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ShortReviewFormProps {
  paperId: string
  onSuccess?: () => void
}

export function ShortReviewForm({ paperId, onSuccess }: ShortReviewFormProps) {
  const t = useTranslations('shortReview')
  const [content, setContent] = useState('')
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const remainingChars = 140 - content.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError(t('errorContentRequired'))
      return
    }

    if (content.length > 140) {
      setError(t('errorContentTooLong'))
      return
    }

    if (!nickname.trim()) {
      setError(t('errorNicknameRequired'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paperId,
          content: content.trim(),
          nickname: nickname.trim(),
          type: 'short',
        }),
      })

      if (!response.ok) {
        throw new Error(t('errorSubmitFailed'))
      }

      setContent('')
      setNickname('')
      onSuccess?.()
    } catch {
      setError(t('errorSubmitFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nickname">{t('nickname')}</Label>
        <Input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t('nicknamePlaceholder')}
          maxLength={20}
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="content">{t('title')}</Label>
          <span
            className={`text-sm ${
              remainingChars < 0 ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            {remainingChars}
          </span>
        </div>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('contentPlaceholder')}
          rows={3}
          maxLength={140}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? t('publishing') : t('publish')}
      </Button>
    </form>
  )
}
