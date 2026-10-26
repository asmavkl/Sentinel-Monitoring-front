import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';
import { useAvailableHealthQueries } from '../hooks';

interface AddHealthCheckDialogProps {
  open: boolean;
  applicationId: number;
  credentials: DatabaseCredentialDto[];
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (credentialId: number, healthQueryIds: number[]) => void;
}

export function AddHealthCheckDialog({
  open,
  applicationId,
  credentials,
  isSubmitting = false,
  submitError = null,
  onClose,
  onSubmit,
}: AddHealthCheckDialogProps) {
  const [selectedCredentialId, setSelectedCredentialId] = useState<number | ''>('');
  const [selectedQueryIds, setSelectedQueryIds] = useState<number[]>([]);

  const credentialIdNumber = typeof selectedCredentialId === 'number' ? selectedCredentialId : 0;
  const { data: availableQueries, isLoading: isLoadingQueries } = useAvailableHealthQueries(
    applicationId,
    credentialIdNumber,
  );

  const handleCredentialChange = (credentialId: string | number) => {
    const id = typeof credentialId === 'number' ? credentialId : Number(credentialId);
    setSelectedCredentialId(id);
    setSelectedQueryIds([]); // Reset query selection when credential changes
  };

  const handleQueryToggle = (queryId: number) => {
    setSelectedQueryIds((prev) =>
      prev.includes(queryId) ? prev.filter((id) => id !== queryId) : [...prev, queryId],
    );
  };

  const handleSubmit = () => {
    if (typeof selectedCredentialId !== 'number' || selectedQueryIds.length === 0) {
      return;
    }
    onSubmit(selectedCredentialId, selectedQueryIds);
  };

  const isFormValid = typeof selectedCredentialId === 'number' && selectedQueryIds.length > 0;

  // Filter to only relational credentials
  const relationalCredentials = credentials.filter((cred) => {
    const type = cred.credentialType;
    return type !== undefined && [1, 4, 5, 6].includes(type); // SqlServer, PostgreSql, MySql, Oracle
  });

  // Filter out already-provisioned queries
  const availableQueriesFiltered = availableQueries?.filter((q) => !q.isAlreadyProvisioned) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>افزودن نظارت سلامت</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Credential Selection */}
          <Box>
            <FormControl fullWidth>
              <InputLabel id="credential-select-label">Credential</InputLabel>
              <Select
                labelId="credential-select-label"
                id="credential-select"
                label="Credential"
                value={selectedCredentialId}
                onChange={(e) => handleCredentialChange(e.target.value)}
                disabled={isSubmitting}
              >
                <MenuItem value="">
                  <em>انتخاب کنید</em>
                </MenuItem>
                {relationalCredentials.map((credential) => (
                  <MenuItem key={credential.id} value={credential.id} disabled={!credential.isActive}>
                    {credential.name}
                    {!credential.isActive && ' (غیرفعال)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Query Selection */}
          {typeof selectedCredentialId === 'number' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                انتخاب Health Queries
              </Typography>
              {isLoadingQueries ? (
                <LinearProgress />
              ) : availableQueriesFiltered.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {availableQueries && availableQueries.length > 0
                    ? 'همه کوئری های سلامت سازگار قبلاً فعال شده‌اند.'
                    : 'برای این اعتبارنامه هیچ کوئری سلامت سازگاری یافت نشد.'}
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {availableQueriesFiltered.map((query) => (
                    <FormControlLabel
                      key={query.id}
                      control={
                        <Checkbox
                          checked={selectedQueryIds.includes(query.id)}
                          onChange={() => handleQueryToggle(query.id)}
                        />
                      }
                      label={<Typography variant="body2">{query.displayName}</Typography>}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {submitError && <Alert severity="error">{submitError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          انصراف
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isFormValid || isSubmitting}>
          افزودن
        </Button>
      </DialogActions>
    </Dialog>
  );
}
