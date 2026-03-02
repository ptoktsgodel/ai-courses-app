import { useCallback, useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs, { type Dayjs } from 'dayjs'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts/types/component/Tooltip'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import type { Item } from '../../types/items'
import { getItems } from '../../services/items-service'

interface ChartDataPoint {
  label: string
  spent: number
  planned: number
}

type CustomTooltipProps = TooltipContentProps<ValueType, NameType>

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const planned = (payload.find((p) => p.dataKey === 'planned')?.value as number) ?? 0
  const spent = (payload.find((p) => p.dataKey === 'spent')?.value as number) ?? 0
  const diff = spent - planned
  const diffColor = diff > 0 ? '#ef4444' : diff < 0 ? '#22c55e' : '#64748b'
  const diffLabel = diff > 0 ? `+$${diff.toFixed(2)} over budget` : diff < 0 ? `-$${Math.abs(diff).toFixed(2)} under budget` : 'On budget'

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
        minWidth: 160,
      }}
    >
      <Typography variant="caption" fontWeight={700} color="text.primary" display="block" mb={0.5}>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Planned: <strong>${planned.toFixed(2)}</strong>
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Spent: <strong>${spent.toFixed(2)}</strong>
      </Typography>
      <Typography variant="caption" display="block" sx={{ color: diffColor, mt: 0.5 }}>
        {diffLabel}
      </Typography>
    </Box>
  )
}

export default function SpendingChart() {
  const today = dayjs()
  const [fromMonth, setFromMonth] = useState<Dayjs>(today.startOf('month'))
  const [toMonth, setToMonth] = useState<Dayjs>(today.startOf('month'))
  const [groupByMonth, setGroupByMonth] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isMultiMonth = !fromMonth.isSame(toMonth, 'month')

  const fetchData = useCallback(async (from: Dayjs, to: Dayjs) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getItems(from.startOf('month').toDate(), to.endOf('month').toDate())
      setItems(data)
    } catch {
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(fromMonth, toMonth)
  }, [fromMonth, toMonth, fetchData])

  const data = useMemo<ChartDataPoint[]>(() => {
    const rangeStart = fromMonth.startOf('month')
    const rangeEnd = toMonth.endOf('month')
    const buckets: Record<string, { spent: number; planned: number }> = {}

    items.forEach((item) => {
      const date = dayjs(item.date)
      if (date.isBefore(rangeStart, 'day') || date.isAfter(rangeEnd, 'day')) return

      const key = isMultiMonth && groupByMonth
        ? date.format('YYYY-MM')
        : date.format('YYYY-MM-DD')

      if (!buckets[key]) buckets[key] = { spent: 0, planned: 0 }

      item.payments.forEach((p) => {
        buckets[key].spent += p.spentAmount ?? 0
        buckets[key].planned += p.plannedAmount ?? 0
      })
    })

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => ({
        label: isMultiMonth && groupByMonth
          ? dayjs(key + '-01').format('MMM YYYY')
          : dayjs(key).format('MMM D'),
        spent: val.spent,
        planned: val.planned,
      }))
  }, [items, fromMonth, toMonth, groupByMonth, isMultiMonth])

  function handleFromChange(value: Dayjs | null) {
    if (!value) return
    const newFrom = value.startOf('month')
    setFromMonth(newFrom)
    if (newFrom.isAfter(toMonth, 'month')) setToMonth(newFrom)
    if (!isMultiMonth) setGroupByMonth(false)
  }

  function handleToChange(value: Dayjs | null) {
    if (!value) return
    const newTo = value.startOf('month')
    setToMonth(newTo)
    if (newTo.isBefore(fromMonth, 'month')) setFromMonth(newTo)
    if (!isMultiMonth) setGroupByMonth(false)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Controls */}
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" mb={3}>
          <DatePicker
            label="From Month"
            value={fromMonth}
            onChange={handleFromChange}
            views={['year', 'month']}
            openTo="month"
            maxDate={toMonth}
            slotProps={{ textField: { size: 'small' } }}
          />
          <DatePicker
            label="To Month"
            value={toMonth}
            onChange={handleToChange}
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
                  onChange={(e) => setGroupByMonth(e.target.checked)}
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

        {/* Chart */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <Typography variant="body1" color="text.secondary">
              No data for the selected range.
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 8 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `$${v}`}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip content={CustomTooltip} cursor={{ fill: '#f1f5f9' }} />
              <Legend
                formatter={(value) => (
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {value}
                  </Typography>
                )}
              />
              <Bar dataKey="planned" name="planned" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </LocalizationProvider>
  )
}
