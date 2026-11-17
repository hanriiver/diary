import { prisma } from './prisma'

export async function recordActivity(date?: string): Promise<void> {
  const today = date ?? new Date().toISOString().slice(0, 10)
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
