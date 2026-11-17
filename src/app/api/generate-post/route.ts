import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateBlogPost } from '@/lib/claude'

export async function POST(request: NextRequest) {
  const { noteId, title, category } = await request.json()

  const note = await prisma.studyNote.findUnique({ where: { id: noteId } })
  if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

  const noteData = {
    summary: note.summary ?? '',
    keyPoints: note.keyPoints ? (JSON.parse(note.keyPoints) as string[]) : [],
    reviewPoints: note.reviewPoints ? (JSON.parse(note.reviewPoints) as string[]) : [],
    extraContent: note.extraContent ?? '',
    category: category ?? note.category ?? '',
  }

  const content = await generateBlogPost(noteData, title)

  return NextResponse.json({ content })
}
