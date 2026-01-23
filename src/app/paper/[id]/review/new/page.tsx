'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
      setError('请输入评论标题')
      return
    }

    if (!content.trim()) {
      setError('请输入评论内容')
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
          title: title.trim(),
          content: content.trim(),
          nickname: nickname.trim(),
          type: 'long',
        }),
      })

      if (!response.ok) {
        throw new Error('提交失败')
      }

      router.push(`/paper/${paperId}`)
    } catch {
      setError('提交失败，请重试')
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
        返回论文
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>写长评</CardTitle>
          {paper && (
            <p className="text-sm text-gray-500">
              论文：{paper.title}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">
                昵称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="输入你的昵称"
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                评论标题 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给你的评论起个标题"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                评论内容 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你对这篇论文的详细评价...&#10;&#10;支持 Markdown 格式：&#10;- **粗体**&#10;- *斜体*&#10;- `代码`&#10;- [链接](url)"
                rows={15}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                支持 Markdown 格式
              </p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? '发布中...' : '发布长评'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
