import { useState } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import dayjs from 'dayjs'
import useCalendarStore from '../../stores/items-payments-store'
import { addItemPayment, deletePayment } from '../../services/items-service'
import type { Payment } from '../../types/items'

interface DayPopupProps {
  open: boolean
  dateKey: string
  onClose: () => void
}

export default function DayPopup({ open, dateKey, onClose }: DayPopupProps) {
  const dayItem = useCalendarStore((s) => s.items[dateKey])
  const setItem = useCalendarStore((s) => s.setItem)
  const removePayments = useCalendarStore((s) => s.removePayments)

  const payments = dayItem?.payments ?? []
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const validSelectedIds = selectedIds.filter((id) => payments.some((p) => p.id === id))
  const showClearAll = validSelectedIds.length > 1

  const toggleItem = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))

  const handleSelectAll = () =>
    showClearAll ? setSelectedIds([]) : setSelectedIds(payments.map((p) => p.id))

  const handleAdd = async () => {
    setSaving(true)
    try {
      const result = await addItemPayment({
        date: dateKey,
        typeName: `Course ${payments.length + 1}`,
        plannedAmount: Math.floor(Math.random() * 96) + 5,
        spentAmount: null,
      })
      setItem(dateKey, result)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!dayItem || validSelectedIds.length === 0) return
    setSaving(true)
    try {
      await Promise.all(validSelectedIds.map((paymentId) => deletePayment(dayItem.id, paymentId)))
      removePayments(dateKey, validSelectedIds)
      setSelectedIds([])
    } finally {
      setSaving(false)
    }
  }

  const runningTotal = payments.reduce((sum, p) => sum + (p.spentAmount ?? p.plannedAmount ?? 0), 0)

  const columns: Payment[][] = []
  for (let i = 0; i < payments.length; i += 7) {
    columns.push(payments.slice(i, i + 7))
  }
  if (columns.length === 0) columns.push([])

  const colCount = columns.length
  const dialogMaxWidth = colCount === 1 ? 'sm' : colCount === 2 ? 'md' : 'lg'
  const fontSize = Math.max(11, 14 - Math.floor(payments.length / 7))
  const title = dateKey ? dayjs(dateKey).format('MMMM D, YYYY') : ''

  return (
    <Dialog open={open} onClose={onClose} maxWidth={dialogMaxWidth} fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {payments.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No items for this day. Click Add to create one.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'flex-start' }}>
            {columns.map((col, colIdx) => (
              <Box
                key={colIdx}
                sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 190, flex: 1 }}
              >
                {col.map((payment) => {
                  const isSelected = validSelectedIds.includes(payment.id)
                  return (
                    <Box
                      key={payment.id}
                      onClick={() => toggleItem(payment.id)}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'primary.light' : 'action.hover',
                        color: isSelected ? 'primary.contrastText' : 'text.primary',
                        '&:hover': { opacity: 0.85 },
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <Typography sx={{ fontSize, fontWeight: isSelected ? 600 : 400 }}>
                        {payment.typeName}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize,
                          ml: 2,
                          flexShrink: 0,
                          fontVariantNumeric: 'tabular-nums',
                          color: isSelected ? 'inherit' : 'text.secondary',
                        }}
                      >
                        ${(payment.spentAmount ?? payment.plannedAmount ?? 0).toFixed(2)}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            Total: ${runningTotal.toFixed(2)}
          </Typography>
          <Button
            size="small"
            variant="text"
            onClick={handleSelectAll}
            disabled={payments.length === 0}
          >
            {showClearAll ? 'Clear All' : 'Select All'}
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {saving && <CircularProgress size={16} />}
          <Button size="small" variant="contained" onClick={handleAdd} disabled={saving}>
            Add
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={handleRemove}
            disabled={validSelectedIds.length === 0 || saving}
          >
            Remove
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}
