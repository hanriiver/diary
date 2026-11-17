'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

const CATEGORIES = ['개발', 'CS', '알고리즘', '데이터베이스', '네트워크', '기타']

interface Post {
  id: number
  title: string
  content: string
  summary: string | null
  reviewPoints: string | null
  category: string
  isPublic: boolean
  slug: string
  tags: { tag: { name: string } }[]
}

export default function EditPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('개발')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then((r) => r.json())
      .then((data: Post) => {
        setPost(data)
        setTitle(data.title)
        setCategory(data.category)
        setContent(data.content)
        setIsPublic(data.isPublic)
        setTags(data.tags.map((t) => t.tag.name).join(', '))
      })
      .catch(() => setError('포스트를 불러올 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    setError('')

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category,
          isPublic,
          tags: { deleteMany: {}, create: tagList.map((name) => ({ tag: { connectOrCreate: { where: { name }, create: { name } } } })) },
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const updated = await res.json() as Post
      router.push(`/posts/${updated.slug}`)
    } catch {
      setError('저장에 실패했습니다.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-400">로딩 중...</p>
  }

  if (!post && error) {
    return <p className="text-sm text-red-500">{error}</p>
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-6">포스트 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="포스트 제목"
            className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400 w-40"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              태그 (쉼표 구분)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, typescript, ..."
              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 font-mono bg-white focus:outline-none focus:border-blue-400 resize-y"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700 cursor-pointer">
            공개 포스트
          </label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}
