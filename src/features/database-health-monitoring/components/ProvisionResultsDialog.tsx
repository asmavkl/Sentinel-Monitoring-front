import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';
import type { DatabaseHealthQueryDto } from '@/types/databaseHealthQueries';
import type { ProvisioningResultItemDto, ProvisioningResultDto } from '@/types/databaseHealthMonitoring';

interface ProvisionResultsDialogProps {
  open: boolean;
  result: ProvisioningResultDto | null;
  selectedCredentials: DatabaseCredentialDto[];
  selectedQueries: DatabaseHealthQueryDto[];
  onClose: () => void;
}

export function ProvisionResultsDialog({
  open,
  result,
  selectedCredentials,
  selectedQueries,
  onClose,
}: ProvisionResultsDialogProps) {
  if (!result) return null;

  const getCredentialName = (credentialId: number): string => {
    const credential = selectedCredentials.find((c) => c.id === credentialId);
    return credential?.name || `Credential #${credentialId}`;
  };

  const getQueryName = (queryId: number): string => {
    const query = selectedQueries.find((q) => q.id === queryId);
    return query?.displayName || `Query #${queryId}`;
  };

  const getStatusLabel = (item: ProvisioningResultItemDto): string => {
    if (item.error) return 'خطا';
    if (item.created) return 'ایجاد شد';
    return 'وجود داشت';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>نتیجه فعال‌سازی</DialogTitle>
      <DialogContent>
        {/* Summary with checkmarks */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          {result.createdChecks > 0 && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
              <Typography variant="body2">
                {result.createdChecks} مورد با موفقیت ایجاد شد
              </Typography>
            </Stack>
          )}
          {result.existingChecks > 0 && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <InfoIcon sx={{ color: 'info.main', fontSize: 20 }} />
              <Typography variant="body2">
                {result.existingChecks} مورد از قبل وجود داشت
              </Typography>
            </Stack>
          )}
          {result.skipped > 0 && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <CancelIcon sx={{ color: 'warning.main', fontSize: 20 }} />
              <Typography variant="body2">
                {result.skipped} مورد ایجاد نشد (ناسازگار)
              </Typography>
            </Stack>
          )}
          {result.createdWidgets > 0 && (
            <Typography variant="caption" color="text.secondary">
              {result.createdWidgets} ویجت ایجاد شد
            </Typography>
          )}
        </Stack>

        {/* Detail table */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            جزئیات:
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>کوئری سلامت</TableCell>
                  <TableCell>اعتبارنامه</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell>خطا</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{getQueryName(item.healthQueryId)}</TableCell>
                    <TableCell>{getCredentialName(item.databaseCredentialId)}</TableCell>
                    <TableCell>{getStatusLabel(item)}</TableCell>
                    <TableCell>{item.error || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          بستن
        </Button>
      </DialogActions>
    </Dialog>
  );
}
