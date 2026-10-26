import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
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
import type { CheckListItem } from '@/types/checkManagement';
import { getHealthStatusColor, getHealthStatusLabel } from '@/utils/healthStatus';
import { getCheckTypeLabel } from '../utils/checkLabels';

interface CheckTableProps {
  checks: CheckListItem[];
  canWrite?: boolean;
  onView: (check: CheckListItem) => void;
  onEdit: (check: CheckListItem) => void;
  onDelete: (check: CheckListItem) => void;
  onToggleActive: (check: CheckListItem) => void;
  onConfigureCriteria: (check: CheckListItem) => void;
  onConfigureAlert: (check: CheckListItem) => void;
}

export function CheckTable({
  checks,
  canWrite = false,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  onConfigureCriteria,
  onConfigureAlert,
}: CheckTableProps) {
  return (
    <Table size="small" dir="rtl" data-testid="check-table">
      <TableHead>
        <TableRow>
          <TableCell>نام شاخص</TableCell>
          <TableCell>سامانه</TableCell>
          <TableCell>مولفه</TableCell>
          <TableCell>نوع</TableCell>
          <TableCell>فاصله هر اجرا</TableCell>
          <TableCell>مهلت</TableCell>
          <TableCell>فعال</TableCell>
          {/* <TableCell>معیار سلامت</TableCell> */}
          <TableCell>آخرین وضعیت</TableCell>
          <TableCell align="center">عملیات</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {checks.map((check) => {
          return (
            <TableRow key={check.id} hover>
              <TableCell>{check.name}</TableCell>
              <TableCell>{check.applicationName}</TableCell>
              <TableCell>{check.componentName}</TableCell>
              <TableCell>{getCheckTypeLabel(check.checkType)}</TableCell>
              <TableCell>{check.intervalSeconds}</TableCell>
              <TableCell>{check.timeoutSeconds}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={check.isActive ? 'فعال' : 'غیرفعال'}
                  color={check.isActive ? 'info' : 'default'}
                />
              </TableCell>
              {/* <TableCell>
                {check.criteriaDefinition ? (
                  <Chip
                    size="small"
                    label="Configured"
                    color="success"
                  />
                ) : (
                  <Chip
                    size="small"
                    label="معیار سلامت تعریف نشده"
                    color="default"
                  />
                )}
              </TableCell> */}
              <TableCell>
                {check.lastHealthStatus != null ? (
                  <Chip
                    size="small"
                    label={getHealthStatusLabel(check.lastHealthStatus)}
                    sx={{ bgcolor: getHealthStatusColor(check.lastHealthStatus), color: '#FFFFFF' }}
                  />
                ) : (
                  <Chip
                    size="small"
                    label="نامشخص"
                    sx={{ bgcolor: getHealthStatusColor(1), color: '#FFFFFF' }}
                  />
                )}
              </TableCell>
              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title={"مشاهده جزئیات"}>
                  <IconButton
                    size="small"
                    aria-label={`مشاهده ${check.name}`}
                    onClick={() => onView(check)}
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {canWrite ? (
                  <>
                    <Tooltip title="اعلان ایمیل">
                      <IconButton
                        size="small"
                        aria-label={`اعلان ایمیل ${check.name}`}
                        onClick={() => onConfigureAlert(check)}
                      >
                        <MailOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="تنظیم معیار سلامت">
                      <IconButton
                        size="small"
                        aria-label={`تنظیم معیار سلامت ${check.name}`}
                        onClick={() => onConfigureCriteria(check)}
                      >
                        <RuleOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="ویرایش">
                      <IconButton
                        size="small"
                        aria-label={`ویرایش ${check.name}`}
                        onClick={() => onEdit(check)}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={check.isActive ? 'غیرفعال' : 'فعال'}>
                      <IconButton
                        size="small"
                        aria-label={`${check.isActive ? 'غیرفعال کردن' : 'فعال کردن'} ${check.name}`}
                        onClick={() => onToggleActive(check)}
                      >
                        <PowerSettingsNewOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="حذف">
                      <IconButton
                        size="small"
                        aria-label={`حذف ${check.name}`}
                        onClick={() => onDelete(check)}
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
