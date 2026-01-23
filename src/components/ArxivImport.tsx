'use client'

import { useState } from 'react'
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
  const [arxivId, setArxivId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImport = async () => {
    if (!arxivId.trim()) {
      setError('请输入 arXiv ID')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/arxiv?id=${encodeURIComponent(arxivId.trim())}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '导入失败')
      }

      const paper = await response.json()
      onImport({
        ...paper,
        publishedAt: paper.publishedAt,
      })
      setArxivId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败，请检查 arXiv ID')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="arxiv-id">从 arXiv 导入</Label>
      <div className="flex gap-2">
        <Input
          id="arxiv-id"
          value={arxivId}
          onChange={(e) => setArxivId(e.target.value)}
          placeholder="输入 arXiv ID，例如：2301.00234"
          className="flex-1"
        />
        <Button onClick={handleImport} disabled={isLoading} variant="secondary">
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? '导入中...' : '导入'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-gray-500">
        输入论文的 arXiv ID（如 2301.00234 或 cs.CL/2301.00234），将自动获取论文信息
      </p>
    </div>
  )
}
