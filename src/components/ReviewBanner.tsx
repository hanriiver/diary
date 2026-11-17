'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ReviewBanner() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/review')
      .then((r) => r.json())
      .then((data: unknown[]) => setCount(data.length))
      .catch(() => setCount(0))
  }, [])

  if (!count) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-2.5 mb-6 flex items-center justify-between">
      <span className="text-sm text-blue-800">
        복습할 항목이 <strong>{count}개</strong> 있습니다.
      </span>
      <Link
        href="/review"
        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        복습하기
      </Link>
    </div>
  )
}
