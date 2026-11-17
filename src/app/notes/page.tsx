import { prisma } from '@/lib/prisma'
import StudyNoteCard from '@/components/StudyNoteCard'

export default async function NotesPage() {
  const notes = await prisma.studyNote.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Notes</h1>
        <span className="text-sm text-gray-400">{notes.length}개</span>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-gray-400">아직 작성된 노트가 없습니다.</p>
      ) : (
        <div>
          {notes.map((note) => (
            <StudyNoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
