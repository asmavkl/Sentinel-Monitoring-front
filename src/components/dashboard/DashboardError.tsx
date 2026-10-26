import { Alert, AlertTitle, Button, Stack } from '@mui/material';
import { isUnauthorizedError, getErrorMessage } from '@/api/apiUtils';

interface DashboardErrorProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}

export function DashboardError({ error, title, onRetry }: DashboardErrorProps) {
  const isUnauthorized = isUnauthorizedError(error);
  const message = getErrorMessage(error);

  return (
    <Alert
      severity={isUnauthorized ? 'warning' : 'error'}
      action={
        onRetry && !isUnauthorized ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            تلاش مجدد
          </Button>
        ) : undefined
      }
    >
      <AlertTitle>{title ?? (isUnauthorized ? 'عدم دسترسی' : 'بارگذاری داده ممکن نیست')}</AlertTitle>
      <Stack spacing={0.5}>
        <span>{message}</span>
      </Stack>
    </Alert>
  );
}
