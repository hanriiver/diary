import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [totalPosts, allCategories, totalTags, activities] = await Promise.all([
    prisma.post.count(),
    prisma.post.groupBy({ by: ['category'], _count: { id: true } }),
    prisma.tag.count(),
    prisma.activity.findMany({ orderBy: { date: 'desc' } }),
  ])

  const postsByCategory = allCategories.map((c) => ({
    category: c.category,
    count: c._count.id,
  }))

  let streak = 0
  if (activities.length > 0) {
    const today = new Date().toISOString().slice(0, 10)
    const dateSet = new Set(activities.map((a) => a.date))
    let cursor = new Date()
    if (!dateSet.has(today)) {
      cursor.setDate(cursor.getDate() - 1)
    }
    while (true) {
      const d = cursor.toISOString().slice(0, 10)
      if (!dateSet.has(d)) break
      streak++
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  return NextResponse.json({ totalPosts, postsByCategory, totalTags, streak })
}
