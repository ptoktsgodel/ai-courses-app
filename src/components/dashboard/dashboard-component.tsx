import { useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'

export default function DashboardComponent() {
  const [date, setDate] = useState<Dayjs>(dayjs())

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
    </LocalizationProvider>
  )
}
