import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import SchoolIcon from '@mui/icons-material/School'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/auth-store'
import { NAVBAR_HEIGHT } from '../../app'

export default function TopNavbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: NAVBAR_HEIGHT,
        backgroundColor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ height: NAVBAR_HEIGHT, minHeight: `${NAVBAR_HEIGHT}px !important` }}>
        {/* Left section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            <SchoolIcon fontSize="small" />
          </Avatar>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            AI Courses
          </Typography>
        </Box>

        {/* Right section */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isAuthenticated ? (
            <Button variant="outlined" color="primary" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                color="primary"
                component={RouterLink}
                to="/login"
              >
                Login
              </Button>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/register"
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
