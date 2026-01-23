'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ShortReviewFormProps {
  paperId: string
  onSuccess?: () => void
}

export function ShortReviewForm({ paperId, onSuccess }: ShortReviewFormProps) {
  const [content, setContent] = useState('')
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const remainingChars = 140 - content.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('请输入评论内容')
      return
    }

    if (content.length > 140) {
      setError('评论内容不能超过140字')
      return
    }

    if (!nickname.trim()) {
      setError('请输入昵称')
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
        throw new Error('提交失败')
      }

      setContent('')
      setNickname('')
      onSuccess?.()
    } catch {
      setError('提交失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nickname">昵称</Label>
        <Input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="输入你的昵称"
          maxLength={20}
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="content">短评</Label>
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
          placeholder="写下你对这篇论文的简短评价..."
          rows={3}
          maxLength={140}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '提交中...' : '发布短评'}
      </Button>
    </form>
  )
}
