import { Alert, AlertTitle } from '@mui/material';

interface ErrorMessageProps {
  title?: string;
  message: string;
}

export function ErrorMessage({ title = 'خطایی رخ داد', message }: ErrorMessageProps) {
  return (
    <Alert severity="error">
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
}
