export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

interface PostsPageProps {
  searchParams: Promise<{ category?: string; tag?: string; search?: string }>
}

async function getPosts(category?: string, tag?: string, search?: string) {
  return prisma.post.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
      ...(search
        ? { OR: [{ title: { contains: search } }, { content: { contains: search } }] }
        : {}),
    },
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

async function getCategories() {
  const groups = await prisma.post.groupBy({
    by: ['category'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })
  return groups.map((g) => ({ category: g.category, count: g._count.id }))
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams
  const { category, tag, search } = params

  const [posts, categories] = await Promise.all([
    getPosts(category, tag, search),
    getCategories(),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Posts</h1>
        <span className="text-sm text-gray-400">{posts.length}개</span>
      </div>

      <div className="flex gap-6">
        {/* Sidebar: category filters */}
        <aside className="w-36 flex-shrink-0">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Categories
          </div>
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/posts"
                className={`block text-sm px-2 py-1 rounded-md transition-colors ${
                  !category
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                전체
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.category}>
                <Link
                  href={`/posts?category=${encodeURIComponent(c.category)}`}
                  className={`flex items-center justify-between text-sm px-2 py-1 rounded-md transition-colors ${
                    category === c.category
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>{c.category}</span>
                  <span className="text-gray-400 text-xs">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Posts list */}
        <div className="flex-1 min-w-0">
          {/* Search/filter info */}
          {(tag || search) && (
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              {tag && (
                <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                  tag: {tag}
                </span>
              )}
              {search && (
                <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                  &ldquo;{search}&rdquo;
                </span>
              )}
              <Link href="/posts" className="text-blue-600 hover:text-blue-800 text-xs">
                초기화
              </Link>
            </div>
          )}

          {posts.length === 0 ? (
            <p className="text-sm text-gray-400">해당 조건의 포스트가 없습니다.</p>
          ) : (
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
