'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PaperCard } from '@/components/PaperCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { Link } from '@/i18n/navigation'

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

export default function HomePage() {
  const t = useTranslations()
  const tCat = useTranslations('categories')
  const tSort = useTranslations('sort')
  const tHome = useTranslations('home')

  const CATEGORIES = [
    { value: '', label: tCat('all') },
    { value: 'cs.CL', label: tCat('nlp') },
    { value: 'cs.CV', label: tCat('cv') },
    { value: 'cs.LG', label: tCat('ml') },
    { value: 'cs.AI', label: tCat('ai') },
    { value: 'stat.ML', label: tCat('statML') },
  ]

  const SORT_OPTIONS = [
    { value: 'newest', label: tSort('newest') },
    { value: 'rating', label: tSort('rating') },
    { value: 'popular', label: tSort('popular') },
  ]

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
          {tHome('title')}
        </h1>
        <p className="text-gray-600">
          {tHome('subtitle')}
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
              placeholder={tHome('searchPlaceholder')}
              className="pl-10"
            />
          </div>
          <Button type="submit">{t('common.search')}</Button>
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
                {tHome('prevPage')}
              </Button>
              <span className="flex items-center px-4 text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                {tHome('nextPage')}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{tHome('noPapers')}</p>
          <Link href="/paper/add">
            <Button>{tHome('addFirstPaper')}</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
