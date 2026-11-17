import { prisma } from './prisma'

export async function recordActivity(date?: string): Promise<void> {
  const now = new Date()
  const today = date ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const existing = await prisma.activity.findUnique({ where: { date: today } })
  if (existing) {
    await prisma.activity.update({
      where: { date: today },
      data: { count: { increment: 1 } },
    })
  } else {
    await prisma.activity.create({ data: { date: today, count: 1 } })
  }
}
