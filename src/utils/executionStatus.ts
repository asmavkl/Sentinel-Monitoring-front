import { ExecutionStatus } from '@/types/enums';
import type { MonitoringStatus } from '@/utils/status';

export function mapExecutionStatus(status?: ExecutionStatus | null): MonitoringStatus {
  if (status === ExecutionStatus.Success) {
    return 'UP';
  }

  if (
    status === ExecutionStatus.Failed ||
    status === ExecutionStatus.Timeout ||
    status === ExecutionStatus.ConnectionError ||
    status === ExecutionStatus.Unauthorized
  ) {
    return 'DOWN';
  }

  return 'UNKNOWN';
}

export function getExecutionStatusLabel(status?: ExecutionStatus | null): string {
  switch (status) {
    case ExecutionStatus.Success:
      return 'موفق';
    case ExecutionStatus.Failed:
      return 'ناموفق';
    case ExecutionStatus.Timeout:
      return 'اتمام زمان';
    case ExecutionStatus.ConnectionError:
      return 'خطای ارتباط';
    case ExecutionStatus.Unauthorized:
      return 'عدم دسترسی';
    default:
      return 'نامشخص';
  }
}
