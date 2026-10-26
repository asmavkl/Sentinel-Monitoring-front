import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { MonitoringHeader, MonitoringSidebar } from '@/components/monitoring/layout';

export function MainLayout() {
  return (
    <Box
      data-testid="monitoring-shell"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <MonitoringHeader />
      <Box
        data-testid="monitoring-workspace-row"
        data-sidebar-side="right"
        dir="ltr"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          minHeight: 0,
        }}
      >
        <Box
          component="main"
          dir="rtl"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            p: 1.5,
            bgcolor: 'background.default',
          }}
        >
          <Outlet />
        </Box>
        <MonitoringSidebar />
      </Box>
    </Box>
  );
}
