import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processStudyNote } from '@/lib/claude'

export async function POST(request: NextRequest) {
  const { rawContent, category } = await request.json()

  const processed = await processStudyNote(rawContent, category)

  const note = await prisma.studyNote.create({
    data: {
      rawContent,
      category,
      summary: processed.summary,
      keyPoints: JSON.stringify(processed.keyPoints),
      reviewPoints: JSON.stringify(processed.reviewPoints),
      extraContent: processed.extraContent,
    },
  })

  return NextResponse.json(note)
}

export async function GET() {
  const notes = await prisma.studyNote.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(notes)
}
