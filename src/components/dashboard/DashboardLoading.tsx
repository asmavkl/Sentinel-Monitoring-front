import { Box, CircularProgress, Typography } from '@mui/material';

interface DashboardLoadingProps {
  message?: string;
}

export function DashboardLoading({ message = 'در حال بارگذاری داشبورد...' }: DashboardLoadingProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: '40vh',
        py: 4,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
