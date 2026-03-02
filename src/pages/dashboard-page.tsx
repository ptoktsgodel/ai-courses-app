import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import DashboardComponent from '../components/dashboard/dashboard-component'

export default function DashboardPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700}>
        Dashboard
      </Typography>
      <Divider sx={{ my: 2 }} />
      <DashboardComponent />
    </Box>
  )
}
