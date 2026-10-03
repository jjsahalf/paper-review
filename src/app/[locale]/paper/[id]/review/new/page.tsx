'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRouter, Link } from '@/i18n/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

interface Paper {
  id: string
  title: string
}

export default function NewLongReviewPage() {
  const params = useParams()
  const router = useRouter()
  const paperId = params.id as string
  const t = useTranslations('longReview')
  const tShort = useTranslations('shortReview')
  const tCommon = useTranslations('common')

  const [paper, setPaper] = useState<Paper | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
      }
    }

    fetchPaper()
  }, [paperId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError(t('errorTitleRequired'))
      return
    }

    if (!content.trim()) {
      setError(t('errorContentRequired'))
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
          title: title.trim(),
          content: content.trim(),
          nickname: nickname.trim(),
          type: 'long',
        }),
      })

      if (!response.ok) {
        throw new Error(t('errorSubmitFailed'))
      }

      router.push(`/paper/${paperId}`)
    } catch {
      setError(t('errorSubmitFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/paper/${paperId}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {tCommon('backToPaper')}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t('writeLongReview')}</CardTitle>
          {paper && (
            <p className="text-sm text-gray-500">
              {t('forPaper', { title: paper.title })}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">
                {tShort('nickname')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={tShort('nicknamePlaceholder')}
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                {t('reviewTitle')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('reviewTitlePlaceholder')}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                {t('content')} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('contentPlaceholder')}
                rows={15}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                {t('markdownSupported')}
              </p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? t('publishing') : t('publish')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {tCommon('cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
