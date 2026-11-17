import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'
import { recordActivity } from '@/lib/activity'

export async function POST(request: NextRequest) {
  const { title, content, summary, reviewPoints, category, isPublic, tags } =
    await request.json()

  const slug = generateSlug(title)

  const post = await prisma.post.create({
    data: {
      title,
      content,
      summary: summary ?? null,
      reviewPoints: reviewPoints ?? null,
      category,
      isPublic: isPublic ?? false,
      slug,
      tags: {
        create: await Promise.all(
          (tags as string[]).map(async (name: string) => {
            const tag = await prisma.tag.upsert({
              where: { name },
              update: {},
              create: { name },
            })
            return { tagId: tag.id }
          })
        ),
      },
    },
    include: { tags: { include: { tag: true } } },
  })

  await recordActivity()

  return NextResponse.json(post)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const search = searchParams.get('search')
  const isPublicParam = searchParams.get('isPublic')

  const posts = await prisma.post.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(isPublicParam !== null ? { isPublic: isPublicParam === 'true' } : {}),
      ...(tag
        ? { tags: { some: { tag: { name: tag } } } }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { content: { contains: search } },
            ],
          }
        : {}),
    },
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(posts)
}
