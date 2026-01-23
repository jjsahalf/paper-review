import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VoteButtons } from '@/components/VoteButtons'
import { formatDate } from '@/lib/utils'

interface LongReview {
  id: string
  title: string
  content: string
  nickname: string
  upvotes: number
  downvotes: number
  createdAt: string
}

interface LongReviewCardProps {
  review: LongReview
}

export function LongReviewCard({ review }: LongReviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{review.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-700">{review.nickname}</span>
          <span>·</span>
          <span>{formatDate(review.createdAt)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-sm max-w-none mb-4"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(review.content) }}
        />
        <VoteButtons
          reviewId={review.id}
          reviewType="long"
          upvotes={review.upvotes}
          downvotes={review.downvotes}
        />
      </CardContent>
    </Card>
  )
}

// Simple markdown renderer - in production, use a proper library like marked or remark
function renderMarkdown(content: string): string {
  return content
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-100 p-2 rounded my-2 overflow-x-auto"><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/gim, '<code class="bg-gray-100 px-1 rounded">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary-600 hover:underline" target="_blank" rel="noopener">$1</a>')
    // Line breaks
    .replace(/\n/gim, '<br />')
}
