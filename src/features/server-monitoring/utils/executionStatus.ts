import { ExecutionStatus } from '@/types/enums';

const EXECUTION_STATUS_LABELS: Record<ExecutionStatus, string> = {
  [ExecutionStatus.Success]: 'موفق',
  [ExecutionStatus.Failed]: 'ناموفق',
  [ExecutionStatus.Timeout]: 'اتمام مهلت',
  [ExecutionStatus.ConnectionError]: 'خطای اتصال',
  [ExecutionStatus.Unauthorized]: 'عدم دسترسی',
};

export function getExecutionStatusLabel(status: ExecutionStatus | null | undefined): string {
  if (status == null) {
    return 'بدون اجرا';
  }

  return EXECUTION_STATUS_LABELS[status] ?? 'بدون اجرا';
}
