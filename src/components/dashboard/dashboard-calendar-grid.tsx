import { useState } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import dayjs, { Dayjs } from 'dayjs'
import useCalendarStore from '../../stores/items-payments-store'
import { getItemTotal } from '../../types/items'
import DayPopup from './dashboard-day-popup'

interface CalendarGridProps {
  date: Dayjs
  loading?: boolean
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarGrid({ date, loading = false }: CalendarGridProps) {
  const items = useCalendarStore((s) => s.items)
  const [openDay, setOpenDay] = useState<string | null>(null)

  const startDay = date.startOf('month').day()
  const daysInMonth = date.daysInMonth()
  const totalCells = startDay + daysInMonth
  const trailingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)

  const today = dayjs()

  const getDateKey = (day: number) => date.date(day).format('YYYY-MM-DD')

  const getDayTotal = (day: number): number => {
    const item = items[getDateKey(day)]
    return item ? getItemTotal(item) : 0
  }

  const isToday = (day: number): boolean => today.isSame(date.date(day), 'day')

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.6)',
              borderRadius: 1,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
            mt: 2,
          }}
        >
        {/* Day-of-week headers */}
        {DAY_HEADERS.map((d) => (
          <Box key={d} sx={{ textAlign: 'center', py: 0.75 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {d}
            </Typography>
          </Box>
        ))}

        {/* Leading empty cells */}
        {Array.from({ length: startDay }).map((_, i) => (
          <Box key={`empty-start-${i}`} sx={{ minHeight: 72, borderRadius: 1 }} />
        ))}

        {/* Day blocks */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const total = getDayTotal(day)
          const highlight = isToday(day)
          const dateKey = getDateKey(day)
          return (
            <Box
              key={day}
              onClick={() => setOpenDay(dateKey)}
              sx={{
                minHeight: 72,
                borderRadius: 1,
                border: highlight ? 2 : 1,
                borderColor: highlight ? 'primary.main' : 'divider',
                bgcolor: 'background.paper',
                cursor: 'pointer',
                p: 0.75,
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { bgcolor: 'action.hover' },
                transition: 'background-color 0.15s',
              }}
            >
              <Typography
                variant="caption"
                fontWeight={highlight ? 700 : 400}
                color={highlight ? 'primary.main' : 'text.secondary'}
              >
                {day}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexGrow: 1,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={total > 0 ? 600 : 400}
                  color={total > 0 ? 'text.primary' : 'text.disabled'}
                  sx={{ fontSize: 13 }}
                >
                  {total > 0 ? `$${total.toFixed(2)}` : '—'}
                </Typography>
              </Box>
            </Box>
          )
        })}

        {/* Trailing empty cells */}
        {Array.from({ length: trailingCells }).map((_, i) => (
          <Box key={`empty-end-${i}`} sx={{ minHeight: 72, borderRadius: 1 }} />
        ))}
        </Box>
      </Box>

      {openDay !== null && (
        <DayPopup open={true} dateKey={openDay} onClose={() => setOpenDay(null)} />
      )}
    </>
  )
}
