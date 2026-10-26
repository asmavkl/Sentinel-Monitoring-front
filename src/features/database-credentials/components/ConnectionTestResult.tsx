import { Alert, AlertTitle } from '@mui/material';
import { isSnmpCollectionVerification } from '../utils/credentialType';

interface ConnectionTestResultProps {
  success: boolean;
  message?: string | null;
  durationMs?: number | null;
}

export function ConnectionTestResult({ success, message, durationMs }: ConnectionTestResultProps) {
  const informational = isSnmpCollectionVerification(message);
  const severity = informational ? 'info' : success ? 'success' : 'error';
  const title = informational
    ? 'اعتبارنامه SNMP هنگام جمع‌آوری سرور بررسی می‌شود'
    : success
      ? '🟢 اتصال به دیتابیس موفق بود'
      : '🔴 اتصال به دیتابیس برقرار نشد';

  return (
    <Alert severity={severity} data-testid="connection-test-result">
      <AlertTitle>{title}</AlertTitle>
      {message ? <span>{message}</span> : null}
      {!informational && durationMs != null ? <span>{` (${durationMs} ms)`}</span> : null}
    </Alert>
  );
}
