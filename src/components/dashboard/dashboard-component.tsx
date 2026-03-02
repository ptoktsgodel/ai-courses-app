import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import CalendarGrid from './dashboard-calendar-grid'
import useCalendarStore from '../../stores/items-payments-store'
import { getItems } from '../../services/items-service'

export default function DashboardComponent() {
  const [date, setDate] = useState<Dayjs>(dayjs())
  const [loading, setLoading] = useState(false)
  const loadItems = useCalendarStore((s) => s.loadItems)

  const fetchMonth = useCallback(async (month: Dayjs) => {
    setLoading(true)
    try {
      const data = await getItems(month.startOf('month').toDate(), month.endOf('month').toDate())
      loadItems(data)
    } finally {
      setLoading(false)
    }
  }, [loadItems])

  useEffect(() => {
    fetchMonth(date)
  }, [date, fetchMonth])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => setDate(d => d.subtract(1, 'month'))} size="small">
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>

        <DatePicker
          views={['month', 'year']}
          openTo="month"
          value={date}
          onChange={newValue => { if (newValue) setDate(newValue) }}
          slotProps={{ textField: { size: 'small', variant: 'standard' } }}
        />

        <IconButton onClick={() => setDate(d => d.add(1, 'month'))} size="small">
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Box>

      <CalendarGrid date={date} loading={loading} />
    </LocalizationProvider>
  )
}
