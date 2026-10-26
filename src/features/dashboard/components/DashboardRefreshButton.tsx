import RefreshIcon from '@mui/icons-material/Refresh';
import { CircularProgress, IconButton, Tooltip } from '@mui/material';

interface DashboardRefreshButtonProps {
  onRefresh: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function DashboardRefreshButton({
  onRefresh,
  loading = false,
  disabled = false,
}: DashboardRefreshButtonProps) {
  return (
    <Tooltip title="بروزرسانی داشبورد">
      <span>
        <IconButton
          onClick={onRefresh}
          disabled={disabled || loading}
          aria-label="بروزرسانی داشبورد"
        >
          {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
