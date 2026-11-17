import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const reviews = await prisma.reviewSchedule.findMany({
    where: {
      reviewAt: { lte: new Date() },
      isCompleted: false,
    },
    orderBy: { reviewAt: 'asc' },
  })
  return NextResponse.json(reviews)
}
