'use client'

import { useState } from 'react'
import Link from 'next/link'

interface StudyNote {
  id: number
  rawContent: string
  summary: string | null
  keyPoints: string | null
  reviewPoints: string | null
  category: string | null
  createdAt: string | Date
}

interface StudyNoteCardProps {
  note: StudyNote
}

function formatDate(dateStr: string | Date): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as string[]
    return []
  } catch {
    return []
  }
}

export default function StudyNoteCard({ note }: StudyNoteCardProps) {
  const [showKeyPoints, setShowKeyPoints] = useState(false)
  const [showReviewPoints, setShowReviewPoints] = useState(false)

  const keyPoints = parseJsonArray(note.keyPoints)
  const reviewPoints = parseJsonArray(note.reviewPoints)

  return (
    <div className="border border-gray-200 rounded-md p-4 bg-white mb-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatDate(note.createdAt)}</span>
          {note.category && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
              {note.category}
            </span>
          )}
        </div>
        <Link
          href={`/write?noteId=${note.id}`}
          className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded-md transition-colors"
        >
          블로그로 작성
        </Link>
      </div>

      {/* Summary */}
      {note.summary && (
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{note.summary}</p>
      )}

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <div className="mb-2">
          <button
            onClick={() => setShowKeyPoints((v) => !v)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            <span>{showKeyPoints ? '▾' : '▸'}</span>
            핵심 포인트 ({keyPoints.length}개)
          </button>
          {showKeyPoints && (
            <ul className="mt-2 space-y-1 pl-3">
              {keyPoints.map((point, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-gray-300 select-none">-</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Review Points */}
      {reviewPoints.length > 0 && (
        <div>
          <button
            onClick={() => setShowReviewPoints((v) => !v)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            <span>{showReviewPoints ? '▾' : '▸'}</span>
            복습 포인트 ({reviewPoints.length}개)
          </button>
          {showReviewPoints && (
            <ul className="mt-2 space-y-1 pl-3">
              {reviewPoints.map((point, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-gray-300 select-none">-</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
