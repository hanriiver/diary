export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostActions from './PostActions'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

function formatDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { tags: { include: { tag: true } } },
  })

  if (!post) notFound()

  const reviewPoints = parseJsonArray(post.reviewPoints)
  const html = post.content

  return (
    <article>
      {/* Header */}
      <div className="mb-6 pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 leading-tight mb-3">
          {post.title}
        </h1>

        <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500">
          <span>{formatDate(post.createdAt)}</span>
          <span className="text-gray-300">·</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs">
            {post.category}
          </span>
          {!post.isPublic && (
            <span className="border border-gray-200 text-gray-400 px-1.5 py-0.5 rounded-md text-xs">
              비공개
            </span>
          )}
          {post.tags.length > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">
                {post.tags.map((t) => t.tag.name).join(', ')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Summary box */}
      {post.summary && (
        <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3 mb-6">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Summary
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{post.summary}</p>
        </div>
      )}

      {/* Main content */}
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Review points */}
      {reviewPoints.length > 0 && (
        <div className="mt-8 pt-5 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Review Points
          </div>
          <ul className="space-y-1.5">
            {reviewPoints.map((point, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-gray-300 select-none mt-0.5">-</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 pt-5 border-t border-gray-200 flex items-center gap-3">
        <Link
          href={`/posts/${post.slug}/edit`}
          className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-md transition-colors"
        >
          수정
        </Link>
        <PostActions slug={post.slug} />
        <Link
          href="/posts"
          className="text-sm text-gray-400 hover:text-gray-600 ml-auto transition-colors"
        >
          목록으로
        </Link>
      </div>
    </article>
  )
}
