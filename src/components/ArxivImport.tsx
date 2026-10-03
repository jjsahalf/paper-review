'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'

interface ArxivImportProps {
  onImport: (paper: {
    title: string
    authors: string[]
    abstract: string
    arxivId: string
    pdfUrl: string
    publishedAt: string
    categories: string[]
  }) => void
}

export function ArxivImport({ onImport }: ArxivImportProps) {
  const t = useTranslations('arxivImport')
  const [arxivId, setArxivId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImport = async () => {
    if (!arxivId.trim()) {
      setError(t('errorRequired'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/arxiv?id=${encodeURIComponent(arxivId.trim())}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('errorFailed'))
      }

      const paper = await response.json()
      onImport({
        ...paper,
        publishedAt: paper.publishedAt,
      })
      setArxivId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="arxiv-id">{t('label')}</Label>
      <div className="flex gap-2">
        <Input
          id="arxiv-id"
          value={arxivId}
          onChange={(e) => setArxivId(e.target.value)}
          placeholder={t('placeholder')}
          className="flex-1"
        />
        <Button onClick={handleImport} disabled={isLoading} variant="secondary">
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? t('importing') : t('import')}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-gray-500">
        {t('hint')}
      </p>
    </div>
  )
}
