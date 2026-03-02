import { useState } from 'react'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import SpendingChart from './graph-spending-chart'
import GraphAnalysisChart from './graph-analysis-chart'

export default function GraphComponent() {
  const [spendingOpen, setSpendingOpen] = useState(true)
  const [analysisOpen, setAnalysisOpen] = useState(true)

  return (
    <Box>
      {/* Spending vs Planned section */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h4" fontWeight={700}>
          Spending vs Planned
        </Typography>
        <Tooltip title={spendingOpen ? 'Collapse' : 'Expand'}>
          <IconButton onClick={() => setSpendingOpen((v) => !v)} size="small">
            {spendingOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Tooltip>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Collapse in={spendingOpen} unmountOnExit>
        <SpendingChart />
      </Collapse>

      {/* Spending by Type section */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mt={4} mb={1}>
        <Typography variant="h4" fontWeight={700}>
          Spending by Type
        </Typography>
        <Tooltip title={analysisOpen ? 'Collapse' : 'Expand'}>
          <IconButton onClick={() => setAnalysisOpen((v) => !v)} size="small">
            {analysisOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Tooltip>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Collapse in={analysisOpen} unmountOnExit>
        <GraphAnalysisChart />
      </Collapse>
    </Box>
  )
}
