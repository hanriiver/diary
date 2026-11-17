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

function getCellColor(count: number): string {
  if (count === 0) return '#ebedf0'
  if (count === 1) return '#9be9a8'
  if (count <= 3) return '#40c463'
  if (count <= 6) return '#30a14e'
  return '#216e39'
}

const DAY_LABELS = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const COLS = 53
const CELL = 11
const GAP = 2
const LEFT = 32
const TOP = 20

export default function Heatmap({ activities, onDateClick, selectedDate }: HeatmapProps) {
  const activityMap = new Map<string, number>()
  for (const a of activities) {
    activityMap.set(a.date, a.count)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toLocalDateStr(today)

  // 오늘이 속한 주의 일요일을 마지막 컬럼 시작으로
  const lastSunday = new Date(today)
  lastSunday.setDate(today.getDate() - today.getDay())

  // 52주 전 일요일을 첫 컬럼 시작으로
  const firstSunday = new Date(lastSunday)
  firstSunday.setDate(lastSunday.getDate() - (COLS - 1) * 7)

  type Cell = { date: string; count: number; isFuture: boolean }
  const weeks: Cell[][] = []
  const monthLabels: { col: number; label: string }[] = []
  const seenMonths = new Set<string>()

  const cursor = new Date(firstSunday)

  for (let col = 0; col < COLS; col++) {
    const week: Cell[] = []

    for (let row = 0; row < 7; row++) {
      const dateStr = toLocalDateStr(cursor)
      const isFuture = cursor > today
      week.push({
        date: dateStr,
        count: activityMap.get(dateStr) ?? 0,
        isFuture,
      })

      if (row === 0) {
        const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`
        if (!seenMonths.has(monthKey) && !isFuture) {
          seenMonths.add(monthKey)
          monthLabels.push({ col, label: MONTH_NAMES[cursor.getMonth()] })
        }
      }

      cursor.setDate(cursor.getDate() + 1)
    }

    weeks.push(week)
  }

  const totalWidth = LEFT + COLS * (CELL + GAP)
  const totalHeight = TOP + 7 * (CELL + GAP)

  return (
    <div className="overflow-x-auto">
      <div style={{ position: 'relative', width: totalWidth, height: totalHeight, minWidth: totalWidth }}>

        {/* Month labels */}
        {monthLabels.map(({ col, label }, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: LEFT + col * (CELL + GAP),
              top: 0,
              fontSize: 10,
              color: '#6b7280',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        ))}

        {/* Day labels */}
        {DAY_LABELS.map((label, row) =>
          label ? (
            <span
              key={row}
              style={{
                position: 'absolute',
                left: 0,
                top: TOP + row * (CELL + GAP) + 1,
                fontSize: 9,
                color: '#9ca3af',
                lineHeight: 1,
                width: LEFT - 6,
                textAlign: 'right',
              }}
            >
              {label}
            </span>
          ) : null
        )}

        {/* Cells */}
        {weeks.map((week, col) =>
          week.map((cell, row) => {
            const isToday = cell.date === todayStr
            return (
              <div
                key={`${col}-${row}`}
                title={!cell.isFuture ? `${formatDate(cell.date)}: ${cell.count}회` : ''}
                onClick={() => !cell.isFuture && cell.count > 0 && onDateClick?.(cell.date)}
                style={{
                  position: 'absolute',
                  left: LEFT + col * (CELL + GAP),
                  top: TOP + row * (CELL + GAP),
                  width: CELL - 1,
                  height: CELL - 1,
                  borderRadius: 2,
                  backgroundColor: cell.isFuture ? 'transparent' : getCellColor(cell.count),
                  cursor: !cell.isFuture && cell.count > 0 ? 'pointer' : 'default',
                  outline: selectedDate === cell.date
                    ? '2px solid #1d4ed8'
                    : isToday
                    ? '1px solid #6b7280'
                    : undefined,
                  outlineOffset: '1px',
                }}
              />
            )
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2" style={{ marginLeft: LEFT }}>
        <span className="text-xs text-gray-400 mr-0.5">Less</span>
        {[0, 1, 2, 4, 7].map((count) => (
          <div
            key={count}
            style={{
              width: CELL - 1,
              height: CELL - 1,
              borderRadius: 2,
              backgroundColor: getCellColor(count),
              flexShrink: 0,
            }}
          />
        ))}
        <span className="text-xs text-gray-400 ml-0.5">More</span>
      </div>
    </div>
  )
}
