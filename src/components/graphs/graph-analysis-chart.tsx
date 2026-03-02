import { useCallback, useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs, { type Dayjs } from 'dayjs'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Item } from '../../types/items'
import { getItems } from '../../services/items-service'
import GraphDateSelector from './graph-date-selector'

interface TrendDataPoint {
  label: string
  [typeName: string]: number | string
}

const CHART_COLORS = [
  '#6366f1',
  '#f59e0b',
  '#22c55e',
  '#ef4444',
  '#06b6d4',
  '#a855f7',
  '#f97316',
  '#14b8a6',
]

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload?.length) return null
  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center" sx={{ mt: 1 }}>
      {payload.map((entry) => {
        const label = entry.value as string
        const isPlanned = label.endsWith('(Planned)')
        return (
          <Stack key={label} direction="row" alignItems="center" spacing={0.75}>
            <svg width={28} height={14} style={{ flexShrink: 0 }}>
              <line
                x1={0} y1={7} x2={28} y2={7}
                stroke={entry.color}
                strokeWidth={2}
                strokeDasharray={isPlanned ? '5 3' : undefined}
              />
            </svg>
            <Typography variant="caption" color="text.secondary" noWrap>
              {label}
            </Typography>
          </Stack>
        )
      })}
    </Stack>
  )
}

export default function GraphAnalysisChart() {
  const today = dayjs()
  const [fromMonth, setFromMonth] = useState<Dayjs>(today.startOf('month'))
  const [toMonth, setToMonth] = useState<Dayjs>(today.startOf('month'))
  const [groupByMonth, setGroupByMonth] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())

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

  const typeKeys = useMemo<string[]>(() => {
    const rangeStart = fromMonth.startOf('month')
    const rangeEnd = toMonth.endOf('month')
    const seen = new Set<string>()
    items.forEach((item) => {
      const date = dayjs(item.date)
      if (date.isBefore(rangeStart, 'day') || date.isAfter(rangeEnd, 'day')) return
      item.payments.forEach((p) => {
        if (p.typeName) seen.add(p.typeName)
      })
    })
    return Array.from(seen).sort()
  }, [items, fromMonth, toMonth])

  // Auto-select any newly discovered type
  useEffect(() => {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      let changed = false
      typeKeys.forEach((t) => {
        if (!next.has(t)) { next.add(t); changed = true }
      })
      return changed ? next : prev
    })
  }, [typeKeys])

  function toggleType(typeName: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(typeName)) next.delete(typeName)
      else next.add(typeName)
      return next
    })
  }

  const chartData = useMemo<TrendDataPoint[]>(() => {
    const rangeStart = fromMonth.startOf('month')
    const rangeEnd = toMonth.endOf('month')
    const buckets: Record<string, Record<string, number>> = {}
    const useMonthly = isMultiMonth && groupByMonth

    // Pre-seed every day/month in the range so lines span the full period
    let cursor = rangeStart
    while (cursor.isBefore(rangeEnd, useMonthly ? 'month' : 'day') || cursor.isSame(rangeEnd, useMonthly ? 'month' : 'day')) {
      const key = useMonthly ? cursor.format('YYYY-MM') : cursor.format('YYYY-MM-DD')
      buckets[key] = {}
      cursor = cursor.add(1, useMonthly ? 'month' : 'day')
    }

    // Accumulate real payment data
    items.forEach((item) => {
      const date = dayjs(item.date)
      if (date.isBefore(rangeStart, 'day') || date.isAfter(rangeEnd, 'day')) return

      const key = useMonthly ? date.format('YYYY-MM') : date.format('YYYY-MM-DD')

      item.payments.forEach((p) => {
        if (!p.typeName) return
        const spentKey = `${p.typeName}_spent`
        const plannedKey = `${p.typeName}_planned`
        buckets[key][spentKey] = (buckets[key][spentKey] ?? 0) + (p.spentAmount ?? 0)
        buckets[key][plannedKey] = (buckets[key][plannedKey] ?? 0) + (p.plannedAmount ?? 0)
      })
    })

    // Collect all type series keys present across all buckets
    const allSeriesKeys = new Set<string>()
    Object.values(buckets).forEach((b) => Object.keys(b).forEach((k) => allSeriesKeys.add(k)))

    // Fill missing type keys with 0 so every line has a continuous data point
    Object.values(buckets).forEach((b) => {
      allSeriesKeys.forEach((k) => {
        if (!(k in b)) b[k] = 0
      })
    })

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, typeMap]) => ({
        label: useMonthly
          ? dayjs(key + '-01').format('MMM YYYY')
          : dayjs(key).format('MMM D'),
        ...typeMap,
      }))
  }, [items, fromMonth, toMonth, groupByMonth, isMultiMonth])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <GraphDateSelector
          fromMonth={fromMonth}
          toMonth={toMonth}
          isMultiMonth={isMultiMonth}
          groupByMonth={groupByMonth}
          onFromChange={handleFromChange}
          onToChange={handleToChange}
          onGroupByMonthChange={setGroupByMonth}
        />
        {/* Type toggles */}
        {typeKeys.length > 0 && (
          <>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2.5}>
              {typeKeys.map((typeName, i) => {
                const color = CHART_COLORS[i % CHART_COLORS.length]
                const active = selectedTypes.has(typeName)
                return (
                  <Chip
                    key={typeName}
                    label={typeName}
                    size="small"
                    onClick={() => toggleType(typeName)}
                    sx={{
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor: color,
                      bgcolor: active ? color : 'transparent',
                      color: active ? '#fff' : color,
                      fontWeight: 600,
                      '&:hover': { bgcolor: active ? color : `${color}22` },
                    }}
                  />
                )
              })}
            </Stack>
          </>
        )}

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
        ) : chartData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <Typography variant="body1" color="text.secondary">
              No data for the selected range.
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                }
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickCount={8}
                domain={[0, 'auto']}
                width={64}
              />
              <Tooltip
                shared
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number | undefined) => [value != null ? `$${value.toFixed(2)}` : '$0.00']}
              />
              <Legend content={<CustomLegend />} />
              {typeKeys.filter((t) => selectedTypes.has(t)).flatMap((typeName) => {
                const i = typeKeys.indexOf(typeName)
                const color = CHART_COLORS[i % CHART_COLORS.length]
                return [
                  <Line
                    key={`${typeName}_spent`}
                    type="monotone"
                    dataKey={`${typeName}_spent`}
                    name={`${typeName} (Spent)`}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />,
                  <Line
                    key={`${typeName}_planned`}
                    type="monotone"
                    dataKey={`${typeName}_planned`}
                    name={`${typeName} (Planned)`}
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />,
                ]
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    </LocalizationProvider>
  )
}
