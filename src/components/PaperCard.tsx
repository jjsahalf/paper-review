import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RatingStars } from '@/components/RatingStars'
import { parseAuthors, parseCategories } from '@/lib/utils'

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

interface PaperCardProps {
  paper: Paper
}

export function PaperCard({ paper }: PaperCardProps) {
  const authors = parseAuthors(paper.authors)
  const categories = parseCategories(paper.categories)

  return (
    <Link href={`/paper/${paper.id}`}>
      <Card className="paper-card hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex gap-2 flex-wrap mb-2">
            {categories.slice(0, 3).map((category) => (
              <Badge key={category} variant="default" className="text-xs">
                {category}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{categories.length - 3}
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg line-clamp-2 hover:text-primary-600">
            {paper.title}
          </CardTitle>
          <p className="text-sm text-gray-500 line-clamp-1">
            {authors.join(', ')}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
            {paper.abstract}
          </p>
          <div className="flex items-center justify-between">
            <RatingStars
              rating={paper.avgRating}
              readonly
              size="sm"
              showScore
              ratingCount={paper.ratingCount}
            />
            {paper.arxivId && (
              <span className="text-xs text-gray-400">
                arXiv:{paper.arxivId}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
