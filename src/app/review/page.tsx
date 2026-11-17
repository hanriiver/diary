'use client'

import { useEffect, useState } from 'react'

interface ReviewItem {
  id: number
  title: string
  reviewAt: string
  interval: number
  postId: number | null
  noteId: number | null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export default function ReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch('/api/review')
      .then((r) => r.json())
      .then((data: ReviewItem[]) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleComplete(id: number) {
    setCompleting((prev) => new Set(prev).add(id))
    try {
      const res = await fetch(`/api/review/${id}`, { method: 'PATCH' })
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id))
      }
    } finally {
      setCompleting((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-400">로딩 중...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">복습</h1>
        <span className="text-sm text-gray-400">{items.length}개 대기 중</span>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">
          오늘 복습할 항목이 없습니다.
        </div>
      ) : (
        <div className="space-y-0">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  예정: {formatDate(item.reviewAt)} · 간격: {item.interval}일
                </div>
              </div>
              <button
                onClick={() => handleComplete(item.id)}
                disabled={completing.has(item.id)}
                className="text-sm text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 ml-4 flex-shrink-0"
              >
                {completing.has(item.id) ? '처리 중...' : '완료'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
