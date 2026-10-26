import { Box, Grid } from '@mui/material';
import { MonitoringSectionHeader } from '@/components/monitoring/layout';
import type { MonitoredServerDto, MonitoredServerStatusDto } from '@/types/monitoredServers';
import { ServerHealthCard } from './ServerHealthCard';

interface ServersWallProps {
  servers: MonitoredServerDto[];
  statusById: Map<number, MonitoredServerStatusDto | undefined>;
  onOpenServer: (serverId: number) => void;
}

export function ServersWall({ servers, statusById, onOpenServer }: ServersWallProps) {
  if (servers.length === 0) {
    return null;
  }

  return (
    <Box data-testid="servers-wall" dir="rtl">
      <Box sx={{ mb: 1 }}>
        <MonitoringSectionHeader title="سرورهای SNMP" color="gray" />
      </Box>
      <Grid container spacing={1}>
        {servers.map((server) => (
          <Grid key={server.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
            <ServerHealthCard
              server={server}
              status={statusById.get(server.id)}
              onOpen={onOpenServer}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
