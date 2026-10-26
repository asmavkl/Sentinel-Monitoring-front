import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import { useLatestDataset } from '@/features/dashboard/hooks';
import type { WidgetComponentProps } from './types';
import { getPrimaryCheckId } from '@/utils/widgetDataSource';
import { isDatasetEmpty } from '@/utils/datasetUtils';

export function DatasetTableWidget({ title, dataSources }: WidgetComponentProps) {
  const checkId = getPrimaryCheckId(dataSources) ?? 0;
  const applicationId = dataSources[0]?.applicationId ?? 0;
  const datasetQuery = useLatestDataset(checkId, applicationId);

  const columns = useMemo(() => {
    return datasetQuery.data?.columns ?? [];
  }, [datasetQuery.data?.columns]);

  const rows = useMemo(() => {
    return datasetQuery.data?.rows ?? [];
  }, [datasetQuery.data?.rows]);

  if (!checkId) {
    return (
      <Typography variant="body2" color="text.secondary">
        منبع داده تنظیم نشده است.
      </Typography>
    );
  }

  if (datasetQuery.isLoading) {
    return <DashboardLoading message="در حال بارگذاری جدول..." />;
  }

  if (datasetQuery.isError) {
    return <DashboardError error={datasetQuery.error} title="بارگذاری جدول ممکن نیست" />;
  }

  if (isDatasetEmpty(datasetQuery.data ?? null)) {
    return (
      <Typography variant="body2" color="text.secondary">
        برای این ویجت داده‌ای ثبت نشده است
      </Typography>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        height: '100%',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        {title}
      </Typography>
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" dir="ltr" sx={{ '& thead th': { backgroundColor: alpha('#1976d2', 0.08) } }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.name}
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    borderBottom: 2,
                    borderColor: 'divider',
                  }}
                >
                  {column.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    داده‌ای موجود نیست
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: alpha('#1976d2', 0.02),
                    },
                    '&:hover': {
                      backgroundColor: alpha('#1976d2', 0.06),
                    },
                  }}
                >
                  {columns.map((column) => {
                    const cellValue = String(row[column.name] ?? '');

                    return (
                      <TableCell
                        key={column.name}
                        sx={{
                          borderBottom: 1,
                          borderColor: 'divider',
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Box
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                          }}
                        >
                          {cellValue}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
