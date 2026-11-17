'use client'

import { useState } from 'react'
import Heatmap from './Heatmap'
import PostCard from './PostCard'

interface Activity {
  date: string
  count: number
}

interface Post {
  id: number
  title: string
  category: string
  slug: string
  createdAt: string
  isPublic: boolean
  tags: { tag: { id: number; name: string } }[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function HeatmapSection({ activities }: { activities: Activity[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)

  async function handleDateClick(date: string) {
    if (selectedDate === date) {
      setSelectedDate(null)
      setPosts([])
      return
    }
    setSelectedDate(date)
    setLoading(true)
    try {
      const res = await fetch(`/api/posts?date=${date}`)
      const data = await res.json() as Post[]
      setPosts(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Heatmap
        activities={activities}
        onDateClick={handleDateClick}
        selectedDate={selectedDate}
      />

      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {formatDate(selectedDate)}
            </span>
            <button
              onClick={() => { setSelectedDate(null); setPosts([]) }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              닫기
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400">불러오는 중...</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-gray-400">작성한 글이 없습니다.</p>
          ) : (
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
