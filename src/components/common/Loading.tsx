import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
  fullHeight?: boolean;
}

export function Loading({ message = 'در حال بارگذاری...', fullHeight = false }: LoadingProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: fullHeight ? '50vh' : undefined,
        py: 4,
      }}
    >
      <CircularProgress size={36} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
