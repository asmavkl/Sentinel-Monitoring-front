import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
import { formatPersianDateTime } from '../utils/formatDate';
import { getApplicationPriorityLabel } from '../utils/applicationPriority';
import type { MonitoringApplicationListItem } from '@/types/monitoringManagement';

interface ApplicationTableProps {
  applications: MonitoringApplicationListItem[];
  canWrite?: boolean;
  onView: (application: MonitoringApplicationListItem) => void;
  onAddComponent: (application: MonitoringApplicationListItem) => void;
  onEdit: (application: MonitoringApplicationListItem) => void;
  onDelete: (application: MonitoringApplicationListItem) => void;
}

function formatCount(value: number | null): string {
  return value == null ? '—' : String(value);
}

export function ApplicationTable({
  applications,
  canWrite = false,
  onView,
  onAddComponent,
  onEdit,
  onDelete,
}: ApplicationTableProps) {
  return (
    <Table size="small" dir="rtl" data-testid="application-table">
      <TableHead>
        <TableRow>
          <TableCell>نام سامانه</TableCell>
          <TableCell>کد سامانه</TableCell>
          <TableCell>اولویت</TableCell>
          {/* <TableCell>Base URL</TableCell> */}
          <TableCell>وضعیت</TableCell>
          <TableCell>تعداد مولفه</TableCell>
          <TableCell>تعداد شاخص</TableCell>
          <TableCell>آخرین بروزرسانی</TableCell>
          <TableCell align="center">عملیات</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {applications.map((application) => (
          <TableRow key={application.id} hover>
            <TableCell>{application.name}</TableCell>
            <TableCell>{application.code}</TableCell>
            <TableCell>{getApplicationPriorityLabel(application.priority)}</TableCell>
            {/* <TableCell>{application.baseUrl || '—'}</TableCell> */}
            <TableCell>
              <Chip
                size="small"
                label={application.isActive ? 'فعال' : 'غیرفعال'}
                color={application.isActive ? 'info' : 'default'}
              />
            </TableCell>
            <TableCell>{formatCount(application.componentCount)}</TableCell>
            <TableCell>{formatCount(application.checkCount)}</TableCell>
            <TableCell>{formatPersianDateTime(application.createdDate)}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
              <Tooltip title="مشاهده جزئیات">
                <IconButton
                  size="small"
                  aria-label={`مشاهده ${application.name}`}
                  onClick={() => onView(application)}
                >
                  <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {canWrite ? (
                <>
                  <Tooltip title="افزودن مولفه">
                    <IconButton
                      size="small"
                      aria-label={`افزودن مولفه به ${application.name}`}
                      onClick={() => onAddComponent(application)}
                    >
                      <AddCircleOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="ویرایش">
                    <IconButton
                      size="small"
                      aria-label={`ویرایش ${application.name}`}
                      onClick={() => onEdit(application)}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="حذف">
                    <IconButton
                      size="small"
                      aria-label={`حذف ${application.name}`}
                      onClick={() => onDelete(application)}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
