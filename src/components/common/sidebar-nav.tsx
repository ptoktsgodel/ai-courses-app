import { useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from '../../app'

interface NavItem {
  label: string
  icon: React.ReactNode
  to: string
}

const topItems: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, to: '/dashboard' },
  { label: 'Graphs', icon: <BarChartIcon />, to: '/graphs' },
]

const bottomItems: NavItem[] = [
  { label: 'Settings', icon: <SettingsIcon />, to: '/settings' },
]

export default function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.to
    const button = (
      <ListItem key={item.label} disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          component={RouterLink}
          to={item.to}
          selected={isActive}
          sx={{
            minHeight: 48,
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: collapsed ? 0 : 2,
              justifyContent: 'center',
              color: isActive ? 'primary.main' : 'inherit',
            }}
          >
            {item.icon}
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }}
            />
          )}
        </ListItemButton>
      </ListItem>
    )

    return collapsed ? (
      <Tooltip key={item.label} title={item.label} placement="right">
        <span>{button}</span>
      </Tooltip>
    ) : (
      button
    )
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          mt: `${NAVBAR_HEIGHT}px`,
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          transition: 'width 0.2s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Toggle header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          px: 1,
          py: 0.5,
        }}
      >
        <IconButton onClick={() => setCollapsed((prev) => !prev)} size="small">
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* Top nav items */}
      <List>{topItems.map(renderNavItem)}</List>

      {/* Bottom nav items */}
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>{bottomItems.map(renderNavItem)}</List>
    </Drawer>
  )
}
