import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params
  const id = parseInt(idStr, 10)

  const current = await prisma.reviewSchedule.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.reviewSchedule.update({
    where: { id },
    data: { isCompleted: true },
  })

  const nextInterval = current.interval * 2
  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + nextInterval)

  const next = await prisma.reviewSchedule.create({
    data: {
      postId: current.postId,
      noteId: current.noteId,
      title: current.title,
      reviewAt: nextReviewAt,
      interval: nextInterval,
      isCompleted: false,
    },
  })

  return NextResponse.json({ completed: id, next })
}
