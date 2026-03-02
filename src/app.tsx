import { Routes, Route, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import TopNavbar from './components/common/top-navbar'
import SidebarNav from './components/common/sidebar-nav'
import LoginPage from './pages/login-page'
import RegisterPage from './pages/register-page'
import DashboardPage from './pages/dashboard-page'
import GraphsPage from './pages/graphs-page'

const NAVBAR_HEIGHT = 64
const SIDEBAR_WIDTH_EXPANDED = 240
const SIDEBAR_WIDTH_COLLAPSED = 64

export { NAVBAR_HEIGHT, SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED }

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <Box sx={{ display: 'flex' }}>
            <TopNavbar />
            <SidebarNav />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                mt: `${NAVBAR_HEIGHT}px`,
                p: 3,
                minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
              }}
            >
              <Routes>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="graphs" element={<GraphsPage />} />
              </Routes>
            </Box>
          </Box>
        }
        path="/*"
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
