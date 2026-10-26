import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined';
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
import type { DatabaseHealthQueryDto } from '@/types/databaseHealthQueries';
import { getHealthQueryCategoryLabel, getHealthQueryDatabaseTypeLabel } from '../utils/labels';

interface HealthQueryTableProps {
  queries: DatabaseHealthQueryDto[];
  canWrite?: boolean;
  togglingId?: number | null;
  onEdit: (query: DatabaseHealthQueryDto) => void;
  onToggleActive: (query: DatabaseHealthQueryDto) => void;
}

export function HealthQueryTable({
  queries,
  canWrite = false,
  togglingId = null,
  onEdit,
  onToggleActive,
}: HealthQueryTableProps) {
  return (
    <Table size="small" dir="rtl" data-testid="health-query-table">
      <TableHead>
        <TableRow>
          <TableCell>نام فنی</TableCell>
          <TableCell>نام نمایشی</TableCell>
          <TableCell>نوع پایگاه داده</TableCell>
          <TableCell>دسته‌بندی</TableCell>
          <TableCell>واحد</TableCell>
          <TableCell>وضعیت</TableCell>
          <TableCell>تاریخ به‌روزرسانی</TableCell>
          <TableCell align="center">عملیات</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {queries.map((query) => {
          const isToggling = togglingId === query.id;

          return (
            <TableRow key={query.id} hover>
              <TableCell>{query.name}</TableCell>
              <TableCell>{query.displayName}</TableCell>
              <TableCell>{getHealthQueryDatabaseTypeLabel(query.databaseType)}</TableCell>
              <TableCell>{getHealthQueryCategoryLabel(query.category)}</TableCell>
              <TableCell>{query.unit || '—'}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={query.isActive ? 'فعال' : 'غیرفعال'}
                  color={query.isActive ? 'info' : 'default'}
                />
              </TableCell>
              <TableCell>{formatPersianDateTime(query.updatedDate ?? query.createdDate)}</TableCell>
              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                {canWrite ? (
                  <>
                    <Tooltip title="ویرایش">
                      <IconButton
                        size="small"
                        aria-label={`ویرایش ${query.displayName}`}
                        onClick={() => onEdit(query)}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={query.isActive ? 'غیرفعال' : 'فعال'}>
                      <span>
                        <IconButton
                          size="small"
                          aria-label={`${query.isActive ? 'غیرفعال کردن' : 'فعال کردن'} ${query.displayName}`}
                          disabled={isToggling}
                          onClick={() => onToggleActive(query)}
                        >
                          {isToggling ? (
                            <CircularProgress size={16} aria-label="در حال تغییر وضعیت" />
                          ) : (
                            <PowerSettingsNewOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
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
