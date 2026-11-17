'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = ['개발', 'CS', '알고리즘', '데이터베이스', '네트워크', '기타']

interface StudyNote {
  id: number
  rawContent: string
  summary: string | null
  keyPoints: string | null
  reviewPoints: string | null
  category: string | null
  createdAt: string
}

interface ProcessedNote {
  id: number
  summary: string | null
  keyPoints: string | null
  reviewPoints: string | null
  category: string | null
}

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return []
  try {
    const p = JSON.parse(raw)
    return Array.isArray(p) ? (p as string[]) : []
  } catch {
    return []
  }
}

// Study note submission mode
function StudyMode() {
  const router = useRouter()
  const [rawContent, setRawContent] = useState('')
  const [category, setCategory] = useState('개발')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProcessedNote | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rawContent.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/study-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent, category }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json() as ProcessedNote
      setResult(data)
    } catch {
      setError('노트 처리에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    const keyPoints = parseJsonArray(result.keyPoints)
    const reviewPoints = parseJsonArray(result.reviewPoints)

    return (
      <div>
        <h1 className="text-lg font-semibold text-gray-900 mb-6">노트 처리 완료</h1>

        {result.summary && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Summary</div>
            <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              {result.summary}
            </p>
          </div>
        )}

        {keyPoints.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">핵심 포인트</div>
            <ul className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 space-y-1">
              {keyPoints.map((p, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-gray-300">-</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {reviewPoints.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">복습 포인트</div>
            <ul className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 space-y-1">
              {reviewPoints.map((p, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-gray-300">-</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/write?noteId=${result.id}`)}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            이걸로 블로그 작성
          </button>
          <button
            onClick={() => { setResult(null); setRawContent('') }}
            className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            새 노트
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Study Note</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            내용 붙여넣기
          </label>
          <textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder="공부한 내용을 붙여넣으세요..."
            rows={14}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 font-mono bg-white focus:outline-none focus:border-blue-400 resize-y"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !rawContent.trim()}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : 'AI 분석'}
        </button>
      </form>
    </div>
  )
}

// Blog write mode (when noteId is present)
function BlogWriteMode({ noteId }: { noteId: string }) {
  const router = useRouter()
  const [note, setNote] = useState<StudyNote | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('개발')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loadingNote, setLoadingNote] = useState(true)
  const [loadingDraft, setLoadingDraft] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/study-notes`)
      .then((r) => r.json())
      .then((notes: StudyNote[]) => {
        const found = notes.find((n) => n.id === parseInt(noteId, 10))
        if (found) {
          setNote(found)
          if (found.category) setCategory(found.category)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingNote(false))
  }, [noteId])

  async function handleGenerateDraft() {
    if (!title.trim()) {
      setError('제목을 먼저 입력해주세요.')
      return
    }
    setLoadingDraft(true)
    setError('')
    try {
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: parseInt(noteId, 10), title, category }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json() as { content: string }
      setContent(data.content)
    } catch {
      setError('초안 생성에 실패했습니다.')
    } finally {
      setLoadingDraft(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          summary: note?.summary ?? null,
          reviewPoints: note?.reviewPoints ?? null,
          category,
          isPublic,
          tags: tagList,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const post = await res.json() as { slug: string }
      router.push(`/posts/${post.slug}`)
    } catch {
      setError('포스트 생성에 실패했습니다.')
      setSubmitting(false)
    }
  }

  if (loadingNote) {
    return <p className="text-sm text-gray-400">노트를 불러오는 중...</p>
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-6">블로그 작성</h1>

      {/* Note preview */}
      {note?.summary && (
        <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 mb-5">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">노트 요약</div>
          <p className="text-sm text-gray-600">{note.summary}</p>
        </div>
      )}

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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
              내용
            </label>
            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={loadingDraft}
              className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
            >
              {loadingDraft ? '생성 중...' : 'AI 초안 생성'}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="마크다운으로 작성하세요..."
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
            {submitting ? '저장 중...' : '발행'}
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

function WriteContent() {
  const searchParams = useSearchParams()
  const noteId = searchParams.get('noteId')

  if (noteId) {
    return <BlogWriteMode noteId={noteId} />
  }
  return <StudyMode />
}

export default function WritePage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-400">로딩 중...</p>}>
      <WriteContent />
    </Suspense>
  )
}
