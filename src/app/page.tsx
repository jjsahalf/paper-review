'use client'

import { useState, useEffect } from 'react'
import { PaperCard } from '@/components/PaperCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

interface Paper {
  id: string
  title: string
  authors: string
  abstract: string
  categories: string
  avgRating: number
  ratingCount: number
  arxivId?: string | null
}

const CATEGORIES = [
  { value: '', label: '全部' },
  { value: 'cs.CL', label: 'NLP' },
  { value: 'cs.CV', label: '计算机视觉' },
  { value: 'cs.LG', label: '机器学习' },
  { value: 'cs.AI', label: '人工智能' },
  { value: 'stat.ML', label: '统计机器学习' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: '最新' },
  { value: 'rating', label: '评分最高' },
  { value: 'popular', label: '最多评分' },
]

export default function HomePage() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchPapers = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          sort,
        })
        if (search) params.append('search', search)
        if (category) params.append('category', category)

        const response = await fetch(`/api/papers?${params}`)
        if (response.ok) {
          const data = await response.json()
          setPapers(data.papers)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch papers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPapers()
  }, [search, category, sort, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          发现优质学术论文
        </h1>
        <p className="text-gray-600">
          探索和评论计算机科学与人工智能领域的前沿研究
        </p>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索论文标题、作者或摘要..."
              className="pl-10"
            />
          </div>
          <Button type="submit">搜索</Button>
        </form>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat.value}
                variant={category === cat.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  setCategory(cat.value)
                  setPage(1)
                }}
              >
                {cat.label}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSort(option.value)
                  setPage(1)
                }}
                className={`px-3 py-1 text-sm rounded ${
                  sort === option.value
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Paper list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 shadow animate-pulse"
            >
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : papers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </Button>
              <span className="flex items-center px-4 text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">暂无论文</p>
          <Button onClick={() => (window.location.href = '/paper/add')}>
            添加第一篇论文
          </Button>
        </div>
      )}
    </div>
  )
}
