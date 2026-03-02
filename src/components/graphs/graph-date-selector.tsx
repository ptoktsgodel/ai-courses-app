import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type { Dayjs } from 'dayjs'

interface GraphDateSelectorProps {
  fromMonth: Dayjs
  toMonth: Dayjs
  isMultiMonth: boolean
  groupByMonth: boolean
  onFromChange: (value: Dayjs | null) => void
  onToChange: (value: Dayjs | null) => void
  onGroupByMonthChange: (checked: boolean) => void
}

export default function GraphDateSelector({
  fromMonth,
  toMonth,
  isMultiMonth,
  groupByMonth,
  onFromChange,
  onToChange,
  onGroupByMonthChange,
}: GraphDateSelectorProps) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" mb={3}>
      <DatePicker
        label="From Month"
        value={fromMonth}
        onChange={onFromChange}
        views={['year', 'month']}
        openTo="month"
        maxDate={toMonth}
        slotProps={{ textField: { size: 'small' } }}
      />
      <DatePicker
        label="To Month"
        value={toMonth}
        onChange={onToChange}
        views={['year', 'month']}
        openTo="month"
        minDate={fromMonth}
        slotProps={{ textField: { size: 'small' } }}
      />
      {isMultiMonth && (
        <FormControlLabel
          control={
            <Switch
              checked={groupByMonth}
              onChange={(e) => onGroupByMonthChange(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              Group by month
            </Typography>
          }
        />
      )}
    </Stack>
  )
}
