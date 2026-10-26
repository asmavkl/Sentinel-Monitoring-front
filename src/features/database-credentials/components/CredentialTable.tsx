import CableOutlinedIcon from '@mui/icons-material/CableOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Chip,
  CircularProgress,
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
import { CREDENTIAL_NAME_LABEL } from '../utils/credentialLabels';
import { CredentialType } from '@/types/enums';
import {
  getCredentialType,
  getCredentialTypeLabel,
  getSnmpVersionLabel,
} from '../utils/credentialType';

interface CredentialTableProps {
  credentials: DatabaseCredentialDto[];
  canWrite?: boolean;
  testingId?: number | null;
  togglingId?: number | null;
  onView: (credential: DatabaseCredentialDto) => void;
  onEdit: (credential: DatabaseCredentialDto) => void;
  onDelete: (credential: DatabaseCredentialDto) => void;
  onToggleActive: (credential: DatabaseCredentialDto) => void;
  onTestConnection: (credential: DatabaseCredentialDto) => void;
}

function getConnectionStatusLabel(credential: DatabaseCredentialDto): string {
  return credential.isActive ? 'فعال' : 'غیرفعال';
}

export function CredentialTable({
  credentials,
  canWrite = false,
  testingId = null,
  togglingId = null,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  onTestConnection,
}: CredentialTableProps) {
  return (
    <Table size="small" dir="rtl" data-testid="credential-table">
      <TableHead>
        <TableRow>
          <TableCell>{CREDENTIAL_NAME_LABEL}</TableCell>
          <TableCell>نوع</TableCell>
          <TableCell>سرور</TableCell>
          <TableCell>دیتابیس</TableCell>
          <TableCell>نام کاربری</TableCell>
          <TableCell>وضعیت اتصال</TableCell>
          <TableCell>تاریخ ایجاد</TableCell>
          <TableCell align="center">عملیات</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {credentials.map((credential) => {
          const isTesting = testingId === credential.id;
          const isToggling = togglingId === credential.id;
          const credentialType = getCredentialType(credential);

          return (
            <TableRow key={credential.id} hover>
              <TableCell>{credential.name}</TableCell>
              <TableCell>
                {credentialType === CredentialType.Snmp && credential.snmpVersion
                  ? `${getCredentialTypeLabel(credentialType)} ${getSnmpVersionLabel(credential.snmpVersion)}`
                  : getCredentialTypeLabel(credentialType)}
              </TableCell>
              <TableCell>{credential.server || '—'}</TableCell>
              <TableCell>{credential.databaseName || '—'}</TableCell>
              <TableCell>{credential.username}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={getConnectionStatusLabel(credential)}
                  color={credential.isActive ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>{formatPersianDateTime(credential.createdDate)}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title="مشاهده جزئیات">
                  <IconButton
                    size="small"
                    aria-label={`مشاهده ${credential.name}`}
                    onClick={() => onView(credential)}
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {canWrite ? (
                  <>
                    <Tooltip title="ویرایش">
                      <IconButton
                        size="small"
                        aria-label={`ویرایش ${credential.name}`}
                        onClick={() => onEdit(credential)}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="تست اتصال">
                      <IconButton
                        size="small"
                        aria-label={`تست اتصال ${credential.name}`}
                        disabled={isTesting}
                        onClick={() => onTestConnection(credential)}
                      >
                        {isTesting ? (
                          <CircularProgress size={16} aria-label="در حال تست اتصال" />
                        ) : (
                          <CableOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={credential.isActive ? 'غیرفعال' : 'فعال'}>
                      <span>
                        <IconButton
                          size="small"
                          aria-label={`${credential.isActive ? 'غیرفعال کردن' : 'فعال کردن'} ${credential.name}`}
                          disabled={isToggling}
                          onClick={() => onToggleActive(credential)}
                        >
                          {isToggling ? (
                            <CircularProgress size={16} aria-label="در حال تغییر وضعیت" />
                          ) : (
                            <PowerSettingsNewOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="حذف">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`حذف ${credential.name}`}
                        onClick={() => onDelete(credential)}
                      >
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
