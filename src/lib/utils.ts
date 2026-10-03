import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Only allow http(s) links, so user input like `javascript:...` can't end up in an href
export function isSafeUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return ''

  let visitorId = localStorage.getItem('visitorId')
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    localStorage.setItem('visitorId', visitorId)
  }
  return visitorId
}

export function parseAuthors(authors: string): string[] {
  try {
    return JSON.parse(authors)
  } catch {
    return [authors]
  }
}

export function parseCategories(categories: string): string[] {
  try {
    return JSON.parse(categories)
  } catch {
    return [categories]
  }
}
