import AddIcon from '@mui/icons-material/Add';
import StorageIcon from '@mui/icons-material/Storage';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { buildCheckRoute } from '@/routes/paths';
import { useDatabaseCredentials } from '@/features/database-credentials/hooks';
import { useDatabaseHealthQueries } from '@/features/database-health-queries/hooks';
import { useProvisionedChecks } from '../hooks';

interface ProvisionedChecksTableProps {
  applicationId: number;
  actions?: ReactNode;
  onProvision?: () => void;
}

export function ProvisionedChecksTable({
  applicationId,
  actions,
  onProvision,
}: ProvisionedChecksTableProps) {
  const { data: provisionedChecks, isLoading: isLoadingChecks } = useProvisionedChecks(applicationId);
  const { data: credentials } = useDatabaseCredentials();
  const { data: healthQueries } = useDatabaseHealthQueries({ isActive: true });

  const getCredentialName = (credentialId: number): string => {
    const credential = credentials?.find((c) => c.id === credentialId);
    return credential?.name || `Credential #${credentialId}`;
  };

  const getQueryName = (queryId: number): string => {
    const query = healthQueries?.find((q) => q.id === queryId);
    return query?.displayName || `Query #${queryId}`;
  };

  // Calculate summary stats
  const uniqueCredentials = new Set(provisionedChecks?.map((c) => c.databaseCredentialId) || []);
  const databaseCount = uniqueCredentials.size;
  const checkCount = provisionedChecks?.length || 0;

  if (isLoadingChecks) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          در حال بارگذاری...
        </Typography>
      </Box>
    );
  }

  if (!provisionedChecks || provisionedChecks.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <StorageIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          هنوز نظارت سلامت دیتابیس فعال نشده است
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
          با فعال‌سازی این قابلیت می‌توانید سلامت دیتابیس‌های متصل به این Application را پایش کنید.
        </Typography>
        {onProvision && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onProvision}>
            فعال‌سازی نظارت
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary and Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`دیتابیس‌ها: ${databaseCount}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`شاخص‌های فعال: ${checkCount}`}
            size="small"
            color="success"
            variant="outlined"
          />
        </Box>
        {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
      </Box>

      {/* Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>اعتبارنامه</TableCell>
              <TableCell>کوئری سلامت</TableCell>
              <TableCell>شناسه شاخص</TableCell>
              <TableCell>شناسه ویجت</TableCell>
              <TableCell align="right" >
                عملیات
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {provisionedChecks.map((check) => (
              <TableRow key={`${check.healthQueryId}-${check.databaseCredentialId}`}>
                <TableCell>{getCredentialName(check.databaseCredentialId)}</TableCell>
                <TableCell>{getQueryName(check.healthQueryId)}</TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {check.checkId ?? '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {check.widgetId ?? '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {check.checkId && (
                    <Tooltip title="مشاهده جزئیات">
                      <IconButton
                        size="small"
                        component={Link}
                        to={buildCheckRoute(check.checkId)}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
