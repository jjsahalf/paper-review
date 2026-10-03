import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  return {
    title: locale === 'zh-CN'
      ? '开源论文评审 - Open Paper Review'
      : 'Open Paper Review',
    description: locale === 'zh-CN'
      ? '开源论文评审 - 探索和评论计算机科学与人工智能领域的前沿研究'
      : 'Explore and review cutting-edge research in computer science and AI',
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as typeof locales[number])) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
              <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link
                  href="/"
                  className="text-xl font-bold text-primary-600 hover:text-primary-700"
                >
                  {locale === 'zh-CN' ? '📚 开源论文评审' : '📚 Open Paper Review'}
                </Link>
                <div className="flex items-center gap-4">
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {locale === 'zh-CN' ? '首页' : 'Home'}
                  </Link>
                  <Link
                    href="/paper/add"
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    {locale === 'zh-CN' ? '添加论文' : 'Add Paper'}
                  </Link>
                  <LanguageSwitcher />
                </div>
              </nav>
            </header>
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
              {children}
            </main>
            <footer className="bg-gray-100 border-t border-gray-200 py-6">
              <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
                {locale === 'zh-CN'
                  ? '开源论文评审 - 开放的学术论文评论平台'
                  : 'Open Paper Review - Open academic paper review platform'}
              </div>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
