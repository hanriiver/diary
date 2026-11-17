export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import HeatmapSection from '@/components/HeatmapSection'
import PostCard from '@/components/PostCard'
import ReviewBanner from '@/components/ReviewBanner'

async function getStats() {
  const [totalPosts, allCategories, activities] = await Promise.all([
    prisma.post.count(),
    prisma.post.groupBy({ by: ['category'], _count: { id: true } }),
    prisma.activity.findMany({ orderBy: { date: 'desc' } }),
  ])

  const totalCategories = allCategories.length

  let streak = 0
  if (activities.length > 0) {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const dateSet = new Set(activities.map((a) => a.date))
    const cursor = new Date()
    if (!dateSet.has(today)) cursor.setDate(cursor.getDate() - 1)
    while (true) {
      const d = cursor.toISOString().slice(0, 10)
      if (!dateSet.has(d)) break
      streak++
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  return { totalPosts, totalCategories, streak }
}

async function getActivities() {
  return prisma.activity.findMany({ orderBy: { date: 'asc' } })
}

async function getRecentPosts() {
  return prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { tags: { include: { tag: true } } },
  })
}

export default async function HomePage() {
  const [stats, activities, recentPosts] = await Promise.all([
    getStats(),
    getActivities(),
    getRecentPosts(),
  ])

  return (
    <div>
      <ReviewBanner />

      <h1 className="text-xl font-semibold text-gray-900 mb-1">study.log</h1>
      <p className="text-sm text-gray-500 mb-6">공부한 것들을 기록합니다.</p>

      {/* Stats row */}
      <div className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-200">
        <div>
          <div className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</div>
          <div className="text-xs text-gray-500 mt-0.5">posts</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div>
          <div className="text-2xl font-semibold text-gray-900">{stats.totalCategories}</div>
          <div className="text-xs text-gray-500 mt-0.5">categories</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div>
          <div className="text-2xl font-semibold text-gray-900">{stats.streak}</div>
          <div className="text-xs text-gray-500 mt-0.5">day streak</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Activity
        </h2>
        <HeatmapSection activities={activities} />
      </div>

      {/* Recent posts */}
      <div>
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Recent Posts
        </h2>
        {recentPosts.length === 0 ? (
          <p className="text-sm text-gray-400">아직 작성된 포스트가 없습니다.</p>
        ) : (
          <div>
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
