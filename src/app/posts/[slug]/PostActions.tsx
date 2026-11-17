'use client'

import { useRouter } from 'next/navigation'

interface PostActionsProps {
  slug: string
}

export default function PostActions({ slug }: PostActionsProps) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('이 포스트를 삭제하시겠습니까?')) return
    const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/posts')
      router.refresh()
    } else {
      alert('삭제에 실패했습니다.')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-md transition-colors"
    >
      삭제
    </button>
  )
}
