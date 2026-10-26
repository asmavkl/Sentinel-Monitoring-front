import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';

interface BackButtonProps {
  fallbackTo: string;
  label?: string;
  sx?: SxProps<Theme>;
}

export function BackButton({ fallbackTo, label = 'بازگشت', sx }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.key !== 'default') {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  };

  return (
    <Button
      variant="text"
      color="inherit"
      size="small"
      startIcon={<ArrowForwardIcon fontSize="small" />}
      onClick={handleClick}
      sx={[
        {
          alignSelf: 'flex-start',
          px: 0.75,
          minWidth: 0,
          color: 'text.secondary',
          fontWeight: 600,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {label}
    </Button>
  );
}
