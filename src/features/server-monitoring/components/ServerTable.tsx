import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { formatPersianDateTime } from '@/features/monitoring-management/utils/formatDate';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';
import { ApplicationHealthStatus } from '@/types/enums';
import type { MonitoredServerDto, MonitoredServerStatusDto } from '@/types/monitoredServers';
import { getHealthStatusColor, getHealthStatusLabel } from '@/utils/healthStatus';
import {
  getMonitoringMethodLabel,
  snmpVersionFromCredential,
} from '../utils/labels';

interface ServerTableProps {
  servers: MonitoredServerDto[];
  credentialsById: Map<number, DatabaseCredentialDto>;
  statusById: Map<number, MonitoredServerStatusDto | undefined>;
  togglingId?: number | null;
  canWrite?: boolean;
  onView: (server: MonitoredServerDto) => void;
  onEdit: (server: MonitoredServerDto) => void;
  onDelete: (server: MonitoredServerDto) => void;
  onToggleActive: (server: MonitoredServerDto) => void;
}

const hiddenOnSmall = { display: { xs: 'none', md: 'table-cell' } };

export function ServerTable({
  servers,
  credentialsById,
  statusById,
  togglingId = null,
  canWrite = false,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: ServerTableProps) {
  return (
    <Table size="small" dir="rtl" data-testid="monitored-server-table">
      <TableHead>
        <TableRow>
          <TableCell>نام</TableCell>
          <TableCell>IP سرور</TableCell>
          <TableCell sx={hiddenOnSmall}>پورت</TableCell>
          <TableCell sx={hiddenOnSmall}>روش</TableCell>
          <TableCell sx={hiddenOnSmall}>نسخه SNMP</TableCell>
          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>اعتبارنامه</TableCell>
          <TableCell>وضعیت</TableCell>
          <TableCell sx={hiddenOnSmall}>آخرین اجرا</TableCell>
          <TableCell sx={hiddenOnSmall}>اجرای بعد</TableCell>
          <TableCell>سلامت</TableCell>
          <TableCell align="center">عملیات</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {servers.map((server) => {
          const credential = credentialsById.get(server.credentialId);
          const status = statusById.get(server.id);
          const health = status?.healthStatus ?? ApplicationHealthStatus.Unknown;
          const isToggling = togglingId === server.id;

          return (
            <TableRow key={server.id} hover>
              <TableCell>{server.name}</TableCell>
              <TableCell>{server.host}</TableCell>
              <TableCell sx={hiddenOnSmall}>{server.port}</TableCell>
              <TableCell sx={hiddenOnSmall}>{getMonitoringMethodLabel()}</TableCell>
              <TableCell sx={hiddenOnSmall}>{snmpVersionFromCredential(credential)}</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {credential?.name ?? '—'}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={server.isActive ? 'فعال' : 'غیرفعال'}
                  color={server.isActive ? 'info' : 'default'}
                />
              </TableCell>
              <TableCell sx={hiddenOnSmall}>{formatPersianDateTime(server.lastRunTime)}</TableCell>
              <TableCell sx={hiddenOnSmall}>{formatPersianDateTime(server.nextRunTime)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={getHealthStatusLabel(health)}
                  sx={{ bgcolor: getHealthStatusColor(health), color: '#FFFFFF' }}
                />
              </TableCell>
              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title="مشاهده جزئیات">
                  <IconButton
                    size="small"
                    aria-label={`مشاهده ${server.name}`}
                    onClick={() => onView(server)}
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {canWrite ? (
                  <>
                    <Tooltip title="ویرایش">
                      <IconButton size="small" aria-label={`ویرایش ${server.name}`} onClick={() => onEdit(server)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={server.isActive ? 'غیرفعال' : 'فعال'}>
                      <span>
                        <IconButton
                          size="small"
                          aria-label={`${server.isActive ? 'غیرفعال کردن' : 'فعال کردن'} ${server.name}`}
                          disabled={isToggling}
                          onClick={() => onToggleActive(server)}
                        >
                          <PowerSettingsNewOutlinedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="حذف">
                      <IconButton size="small" aria-label={`حذف ${server.name}`} onClick={() => onDelete(server)}>
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
