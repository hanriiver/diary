import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'study.log',
  description: 'A personal study blog',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
            <Link
              href="/"
              className="text-sm font-semibold text-gray-900 tracking-tight"
            >
              study.log
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/write"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Write
              </Link>
              <Link
                href="/posts"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Posts
              </Link>
              <Link
                href="/notes"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Notes
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto px-4 h-10 flex items-center">
            <span className="text-xs text-gray-400">2026</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
