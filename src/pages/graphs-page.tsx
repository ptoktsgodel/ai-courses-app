import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import SpendingChart from '../components/graphs/graph-spending-chart'

export default function GraphsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700}>
        Spending vs Planned
      </Typography>
      <Divider sx={{ my: 2 }} />
      <SpendingChart />
    </Box>
  )
}
