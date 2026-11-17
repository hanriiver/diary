import Link from 'next/link'

interface Post {
  id: number
  title: string
  category: string
  slug: string
  createdAt: string | Date
  isPublic: boolean
  tags: { tag: { name: string } }[]
}

interface PostCardProps {
  post: Post
}

function formatDate(dateStr: string | Date): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/posts/${post.slug}`}
            className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors leading-snug"
          >
            {post.title}
          </Link>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
              {post.category}
            </span>
            <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
            {!post.isPublic && (
              <span className="text-xs text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-md">
                비공개
              </span>
            )}
            {post.tags.length > 0 && (
              <span className="text-xs text-gray-400">
                {post.tags.map((t) => t.tag.name).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
