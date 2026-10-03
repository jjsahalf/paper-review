'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArxivImport } from '@/components/ArxivImport'
import { X } from 'lucide-react'

const CATEGORY_OPTIONS = [
  'cs.CL',
  'cs.CV',
  'cs.LG',
  'cs.AI',
  'cs.NE',
  'cs.RO',
  'stat.ML',
  'cs.IR',
  'cs.CR',
  'cs.SE',
]

export default function AddPaperPage() {
  const router = useRouter()
  const t = useTranslations('addPaper')
  const tCommon = useTranslations('common')

  const [title, setTitle] = useState('')
  const [authors, setAuthors] = useState('')
  const [abstract, setAbstract] = useState('')
  const [arxivId, setArxivId] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [publishedAt, setPublishedAt] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleArxivImport = (paper: {
    title: string
    authors: string[]
    abstract: string
    arxivId: string
    pdfUrl: string
    publishedAt: string
    categories: string[]
  }) => {
    setTitle(paper.title)
    setAuthors(paper.authors.join(', '))
    setAbstract(paper.abstract)
    setArxivId(paper.arxivId)
    setPdfUrl(paper.pdfUrl)
    setPublishedAt(paper.publishedAt.split('T')[0])
    setCategories(paper.categories.slice(0, 5))
  }

  const addCategory = (cat: string) => {
    if (cat && !categories.includes(cat)) {
      setCategories([...categories, cat])
    }
    setNewCategory('')
  }

  const removeCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError(t('errorTitleRequired'))
      return
    }

    if (!authors.trim()) {
      setError(t('errorAuthorsRequired'))
      return
    }

    if (!abstract.trim()) {
      setError(t('errorAbstractRequired'))
      return
    }

    setIsLoading(true)

    try {
      const authorList = authors
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)

      const response = await fetch('/api/papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          authors: authorList,
          abstract: abstract.trim(),
          arxivId: arxivId.trim() || null,
          pdfUrl: pdfUrl.trim() || null,
          publishedAt: publishedAt || null,
          categories,
        }),
      })

      if (response.status === 409) {
        const data = await response.json()
        setError(t('errorArxivExists'))
        if (data.paperId) {
          router.push(`/paper/${data.paperId}`)
        }
        return
      }

      if (!response.ok) {
        throw new Error(t('errorSubmitFailed'))
      }

      const paper = await response.json()
      router.push(`/paper/${paper.id}`)
    } catch {
      setError(t('errorSubmitFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* arXiv Import */}
          <div className="bg-gray-50 rounded-lg p-4">
            <ArxivImport onImport={handleArxivImport} />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">{t('orManualEntry')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                {t('paperTitle')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('paperTitlePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authors">
                {t('authors')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="authors"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder={t('authorsPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abstract">
                {t('abstractLabel')} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="abstract"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder={t('abstractPlaceholder')}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arxivId">{t('arxivId')}</Label>
                <Input
                  id="arxivId"
                  value={arxivId}
                  onChange={(e) => setArxivId(e.target.value)}
                  placeholder={t('arxivIdPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishedAt">{t('publishDate')}</Label>
                <Input
                  id="publishedAt"
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdfUrl">{t('pdfLink')}</Label>
              <Input
                id="pdfUrl"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder={t('pdfLinkPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('categoryTags')}</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((cat) => (
                  <Badge key={cat} className="gap-1">
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCategory(cat)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder={t('enterTag')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCategory(newCategory)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCategory(newCategory)}
                >
                  {t('add')}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {CATEGORY_OPTIONS.filter((c) => !categories.includes(c)).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => addCategory(cat)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      + {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? tCommon('submitting') : t('submitPaper')}
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
