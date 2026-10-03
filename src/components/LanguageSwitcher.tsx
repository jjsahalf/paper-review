'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { locales } from '@/i18n/config'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="relative inline-flex items-center">
      <Globe className="w-4 h-4 text-gray-500 mr-1" />
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none bg-transparent text-gray-600 text-sm cursor-pointer hover:text-gray-900 focus:outline-none pr-6"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc === 'zh-CN' ? '中文' : 'English'}
          </option>
        ))}
      </select>
      <svg
        className="w-3 h-3 absolute right-0 text-gray-500 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
