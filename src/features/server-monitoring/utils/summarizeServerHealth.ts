import type { MonitoredServerDto, MonitoredServerStatusDto } from '@/types/monitoredServers';
import { mapApplicationHealthStatus } from '@/utils/status';

export interface ServerHealthSummary {
  up: number;
  warning: number;
  down: number;
  unknown: number;
  outOfService: number;
  total: number;
}

export function summarizeServerHealth(
  servers: MonitoredServerDto[] | undefined,
  serverStatuses: (MonitoredServerStatusDto | undefined)[] | undefined,
): ServerHealthSummary {
  const summary: ServerHealthSummary = {
    up: 0,
    warning: 0,
    down: 0,
    unknown: 0,
    outOfService: 0,
    total: 0,
  };

  if (!servers?.length) {
    return summary;
  }

  servers.forEach((server) => {
    summary.total += 1;

    // اگر سرور غیرفعال است، به عنوان OUT_OF_SERVICE حساب می‌شود
    if (!server.isActive) {
      summary.outOfService += 1;
      return;
    }

    // پیدا کردن وضعیت سرور
    const serverStatus = serverStatuses?.find((status) => status?.serverId === server.id);

    if (!serverStatus) {
      summary.unknown += 1;
      return;
    }

    const healthStatus = mapApplicationHealthStatus(serverStatus.healthStatus);

    if (healthStatus === 'UP') {
      summary.up += 1;
      return;
    }

    if (healthStatus === 'WARNING') {
      summary.warning += 1;
      return;
    }

    if (healthStatus === 'DOWN') {
      summary.down += 1;
      return;
    }

    if (healthStatus === 'OUT_OF_SERVICE') {
      summary.outOfService += 1;
      return;
    }

    summary.unknown += 1;
  });

  return summary;
}
