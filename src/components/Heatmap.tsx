'use client'

interface Activity {
  date: string
  count: number
}

interface HeatmapProps {
  activities: Activity[]
  onDateClick?: (date: string) => void
  selectedDate?: string | null
}

function getCellColor(count: number): string {
  if (count === 0) return '#e5e7eb' // gray-200
  if (count === 1) return '#bfdbfe' // blue-200
  if (count <= 3) return '#60a5fa' // blue-400
  return '#2563eb' // blue-600
}

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Heatmap({ activities, onDateClick, selectedDate }: HeatmapProps) {
  // Build a map of date -> count
  const activityMap = new Map<string, number>()
  for (const a of activities) {
    activityMap.set(a.date, a.count)
  }

  // Build 364 days ending today, arranged as 52 weeks × 7 days
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start from the Sunday 364 days ago (round to week start)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 363)
  // Rewind to the most recent Sunday on or before startDate
  const dayOfWeek = startDate.getDay() // 0=Sun
  startDate.setDate(startDate.getDate() - dayOfWeek)

  // Build 52 columns, each 7 cells
  const weeks: Array<Array<{ date: string; count: number; inRange: boolean }>> = []
  const monthLabels: Array<{ col: number; month: string }> = []

  let seenMonths = new Set<string>()
  const cursor = new Date(startDate)

  for (let col = 0; col < 52; col++) {
    const week: Array<{ date: string; count: number; inRange: boolean }> = []

    for (let row = 0; row < 7; row++) {
      const dateStr = toLocalDateStr(cursor)
      const inRange = cursor >= startDate && cursor <= today
      week.push({
        date: dateStr,
        count: activityMap.get(dateStr) ?? 0,
        inRange,
      })

      // Track month label for this column (first day of the week = row 0)
      if (row === 0 && inRange) {
        const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`
        if (!seenMonths.has(monthKey)) {
          seenMonths.add(monthKey)
          monthLabels.push({ col, month: MONTHS[cursor.getMonth()] })
        }
      }

      cursor.setDate(cursor.getDate() + 1)
    }

    weeks.push(week)
  }

  const cellSize = 10
  const gap = 2
  const leftOffset = 28 // space for day labels
  const topOffset = 18  // space for month labels

  const totalWidth = leftOffset + weeks.length * (cellSize + gap)
  const totalHeight = topOffset + 7 * (cellSize + gap)

  return (
    <div className="overflow-x-auto">
      <div style={{ position: 'relative', width: totalWidth, height: totalHeight, minWidth: totalWidth }}>
        {/* Month labels */}
        {monthLabels.map(({ col, month }) => (
          <span
            key={`${col}-${month}`}
            style={{
              position: 'absolute',
              left: leftOffset + col * (cellSize + gap),
              top: 0,
              fontSize: 10,
              color: '#6b7280',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {month}
          </span>
        ))}

        {/* Day labels */}
        {DAYS.map((label, row) =>
          label ? (
            <span
              key={row}
              style={{
                position: 'absolute',
                left: 0,
                top: topOffset + row * (cellSize + gap) + 1,
                fontSize: 9,
                color: '#9ca3af',
                lineHeight: 1,
                width: leftOffset - 4,
                textAlign: 'right',
              }}
            >
              {label}
            </span>
          ) : null
        )}

        {/* Cells */}
        {weeks.map((week, col) =>
          week.map((cell, row) => (
            <div
              key={`${col}-${row}`}
              className="heatmap-cell"
              title={cell.inRange ? `${formatDate(cell.date)}: ${cell.count}회` : ''}
              onClick={() => cell.inRange && cell.count > 0 && onDateClick?.(cell.date)}
              style={{
                position: 'absolute',
                left: leftOffset + col * (cellSize + gap),
                top: topOffset + row * (cellSize + gap),
                backgroundColor: cell.inRange ? getCellColor(cell.count) : 'transparent',
                cursor: cell.inRange && cell.count > 0 ? 'pointer' : 'default',
                outline: selectedDate === cell.date ? '2px solid #1d4ed8' : undefined,
                outlineOffset: '1px',
              }}
            />
          ))
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 ml-7">
        <span className="text-xs text-gray-400 mr-1">Less</span>
        {[0, 1, 2, 4].map((count) => (
          <div
            key={count}
            className="heatmap-cell"
            style={{ backgroundColor: getCellColor(count), position: 'static' }}
          />
        ))}
        <span className="text-xs text-gray-400 ml-1">More</span>
      </div>
    </div>
  )
}
