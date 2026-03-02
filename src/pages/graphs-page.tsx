import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function GraphsPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Typography variant="h4" fontWeight={700}>
        Graphs
      </Typography>
    </Box>
  )
}
