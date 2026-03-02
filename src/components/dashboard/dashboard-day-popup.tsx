import { useState, useEffect, useRef } from 'react'
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
import useItemPaymentStore from '../../stores/items-payments-store'
import { addItemPayment, deletePayment, updatePayment, getTypes } from '../../services/items-service'
import PaymentFormDialog from './dashboard-payment-form'
import type { Payment } from '../../types/items'

interface DayPopupProps {
  open: boolean
  dateKey: string
  onClose: () => void
  onRefresh?: () => void
}

export default function DayPopup({ open, dateKey, onClose, onRefresh }: DayPopupProps) {
  const dayItem = useItemPaymentStore((s) => s.items[dateKey])
  const setItem = useItemPaymentStore((s) => s.setItem)
  const storeUpdatePayment = useItemPaymentStore((s) => s.updatePayment)
  const removePayments = useItemPaymentStore((s) => s.removePayments)

  const payments = dayItem?.payments ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [allTypeNames, setAllTypeNames] = useState<string[]>([])
  const dirty = useRef(false)

  useEffect(() => {
    if (open) {
      dirty.current = false
      getTypes()
        .then(setAllTypeNames)
        .catch(() => {})
    }
  }, [open])

  const handleClose = () => {
    if (dirty.current) {
      onRefresh?.()
      dirty.current = false
    }
    onClose()
  }

  const validSelectedId = selectedId && payments.some((p) => p.id === selectedId) ? selectedId : null

  const toggleItem = (id: string) => setSelectedId((prev) => (prev === id ? null : id))

  const handleRemove = async () => {
    if (!dayItem || !validSelectedId) return
    setSaving(true)
    try {
      await deletePayment(dayItem.id, validSelectedId)
      removePayments(dateKey, [validSelectedId])
      setSelectedId(null)
      dirty.current = true
    } finally {
      setSaving(false)
    }
  }

  const handleAddSave = async (typeName: string, plannedAmount: number | null, spentAmount: number | null) => {
    const result = await addItemPayment({ date: dateKey, typeName, plannedAmount, spentAmount })
    setItem(dateKey, result)
    setAddOpen(false)
    getTypes().then(setAllTypeNames).catch(() => {})
    dirty.current = true
  }

  const handleUpdateSave = async (typeName: string, plannedAmount: number | null, spentAmount: number | null) => {
    if (!dayItem || !validSelectedId) return
    const result = await updatePayment(dayItem.id, validSelectedId, { typeName, plannedAmount, spentAmount })
    storeUpdatePayment(dateKey, result)
    setSelectedId(null)
    setUpdateOpen(false)
    getTypes().then(setAllTypeNames).catch(() => {})
    dirty.current = true
  }

  const selectedPayment = validSelectedId ? payments.find((p) => p.id === validSelectedId) : undefined

  const plannedTotal = payments.reduce((sum, p) => sum + (p.plannedAmount ?? 0), 0)
  const spentTotal = payments.reduce((sum, p) => sum + (p.spentAmount ?? 0), 0)

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
    <>
      <Dialog open={open} onClose={handleClose} maxWidth={dialogMaxWidth} fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ position: 'absolute', top: 8, right: 8 }}>
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
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 220, flex: 1 }}
                >
                  {col.map((payment) => {
                    const isSelected = validSelectedId === payment.id
                    const planned = payment.plannedAmount != null ? `$${payment.plannedAmount.toFixed(2)}` : '$0.00'
                    const spent = payment.spentAmount != null ? `$${payment.spentAmount.toFixed(2)}` : '$0.00'
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
                        <Box sx={{ display: 'flex', gap: 1, ml: 2, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                          <Typography sx={{ fontSize, color: isSelected ? 'inherit' : 'success.main', fontWeight: 500 }}>
                            {planned}
                          </Typography>
                          <Typography sx={{ fontSize, color: isSelected ? 'inherit' : 'text.disabled' }}>/</Typography>
                          <Typography sx={{ fontSize, color: isSelected ? 'inherit' : 'error.main', fontWeight: 500 }}>
                            {spent}
                          </Typography>
                        </Box>
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
            <Typography variant="body2" fontWeight={600} sx={{ color: 'success.main' }}>
              Planned: ${plannedTotal.toFixed(2)}
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: 'error.main' }}>
              Spent: ${spentTotal.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {saving && <CircularProgress size={16} />}
            <Button size="small" variant="contained" onClick={() => setAddOpen(true)} disabled={saving}>
              Add
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setUpdateOpen(true)}
              disabled={!validSelectedId || saving}
            >
              Update
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleRemove}
              disabled={!validSelectedId || saving}
            >
              Remove
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <PaymentFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddSave}
        existingTypeNames={allTypeNames}
        title="Add Payment"
      />

      <PaymentFormDialog
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        onSave={handleUpdateSave}
        existingTypeNames={allTypeNames}
        title="Update Payment"
        initialValues={
          selectedPayment
            ? {
                typeName: selectedPayment.typeName,
                plannedAmount: selectedPayment.plannedAmount,
                spentAmount: selectedPayment.spentAmount,
              }
            : undefined
        }
      />
    </>
  )
}
