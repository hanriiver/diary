import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { tags: { include: { tag: true } } },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const data = await request.json()
  const post = await prisma.post.update({
    where: { slug },
    data,
    include: { tags: { include: { tag: true } } },
  })
  return NextResponse.json(post)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  await prisma.post.delete({ where: { slug } })
  return NextResponse.json({ success: true })
}
