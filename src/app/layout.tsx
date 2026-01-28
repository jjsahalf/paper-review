import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '开源论文评审 - Open Paper Review',
  description: '开源论文评审 - 探索和评论计算机科学与人工智能领域的前沿研究',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link
                href="/"
                className="text-xl font-bold text-primary-600 hover:text-primary-700"
              >
                📚 开源论文评审
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900"
                >
                  首页
                </Link>
                <Link
                  href="/paper/add"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  添加论文
                </Link>
              </div>
            </nav>
          </header>
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
            {children}
          </main>
          <footer className="bg-gray-100 border-t border-gray-200 py-6">
            <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
              开源论文评审 - 开放的学术论文评论平台
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
