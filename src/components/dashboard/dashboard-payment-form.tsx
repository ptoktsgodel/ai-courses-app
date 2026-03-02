import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

const NEW_TYPE_SENTINEL = '__new__'

interface PaymentFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (typeName: string, plannedAmount: number | null, spentAmount: number | null) => Promise<void>
  existingTypeNames: string[]
  initialValues?: {
    typeName: string
    plannedAmount: number | null
    spentAmount: number | null
  }
  title: string
}

export default function PaymentFormDialog({
  open,
  onClose,
  onSave,
  existingTypeNames,
  initialValues,
  title,
}: PaymentFormDialogProps) {
  const resolveInitialSelect = (name: string | undefined) => {
    if (!name) return ''
    return existingTypeNames.includes(name) ? name : NEW_TYPE_SENTINEL
  }

  const [selectValue, setSelectValue] = useState(() => resolveInitialSelect(initialValues?.typeName))
  const [customTypeName, setCustomTypeName] = useState(
    initialValues?.typeName && !existingTypeNames.includes(initialValues.typeName)
      ? initialValues.typeName
      : ''
  )
  const [plannedAmount, setPlannedAmount] = useState(initialValues?.plannedAmount?.toString() ?? '')
  const [spentAmount, setSpentAmount] = useState(initialValues?.spentAmount?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectValue(resolveInitialSelect(initialValues?.typeName))
      setCustomTypeName(
        initialValues?.typeName && !existingTypeNames.includes(initialValues.typeName)
          ? initialValues.typeName
          : ''
      )
      setPlannedAmount(initialValues?.plannedAmount?.toString() ?? '')
      setSpentAmount(initialValues?.spentAmount?.toString() ?? '')
      setError(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const typeName = selectValue === NEW_TYPE_SENTINEL ? customTypeName : selectValue

  const handleSave = async () => {
    const planned = plannedAmount !== '' ? parseFloat(plannedAmount) : null
    const spent = spentAmount !== '' ? parseFloat(spentAmount) : null

    if (!typeName.trim()) {
      setError('Type is required.')
      return
    }
    if (planned === null && spent === null) {
      setError('At least one of Planned Amount or Spent Amount is required.')
      return
    }

    setError(null)
    setSaving(true)
    try {
      await onSave(typeName.trim(), planned, spent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl variant="standard" required>
            <InputLabel>Type</InputLabel>
            <Select
              value={selectValue}
              onChange={(e) => {
                setSelectValue(e.target.value)
                if (e.target.value !== NEW_TYPE_SENTINEL) setCustomTypeName('')
              }}
            >
              {existingTypeNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
              <MenuItem value={NEW_TYPE_SENTINEL}>New type…</MenuItem>
            </Select>
          </FormControl>
          {selectValue === NEW_TYPE_SENTINEL && (
            <TextField
              label="New type name"
              variant="standard"
              value={customTypeName}
              onChange={(e) => setCustomTypeName(e.target.value)}
              autoFocus
              required
            />
          )}
          <TextField
            label="Planned Amount"
            variant="standard"
            type="number"
            value={plannedAmount}
            onChange={(e) => setPlannedAmount(e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            label="Spent Amount"
            variant="standard"
            type="number"
            value={spentAmount}
            onChange={(e) => setSpentAmount(e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} /> : null}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
