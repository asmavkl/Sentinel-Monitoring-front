import CheckIcon from '@mui/icons-material/Check';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';
import type { AvailableHealthQueryDto } from '@/types/databaseHealthMonitoring';
import { databaseHealthMonitoringApi } from '@/api/databaseHealthMonitoringApi';

interface ProvisionDialogProps {
  open: boolean;
  applicationId: number;
  credentials: DatabaseCredentialDto[];
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (credentialIds: number[], healthQueryIds: number[]) => void;
}

interface QueryWithCompatibility {
  query: AvailableHealthQueryDto;
  alreadyProvisionedFor: Set<number>; // credential IDs where already provisioned
}

export function ProvisionDialog({
  open,
  applicationId,
  credentials,
  isSubmitting = false,
  submitError = null,
  onClose,
  onSubmit,
}: ProvisionDialogProps) {
  const [selectedCredentialIds, setSelectedCredentialIds] = useState<number[]>([]);
  const [selectedQueryIds, setSelectedQueryIds] = useState<number[]>([]);
  const [queriesWithCompatibility, setQueriesWithCompatibility] = useState<QueryWithCompatibility[]>([]);
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);

  // Load available queries when credentials change
  useEffect(() => {
    if (selectedCredentialIds.length === 0) {
      return;
    }

    const loadQueries = async () => {
      setIsLoadingQueries(true);
      try {
        const queryMap = new Map<number, QueryWithCompatibility>();

        // Load queries for each selected credential
        for (const credentialId of selectedCredentialIds) {
          const queries = await databaseHealthMonitoringApi.getAvailableHealthQueries(
            applicationId,
            credentialId,
          );

          for (const query of queries) {
            const existing = queryMap.get(query.id);
            if (existing) {
              // Track provisioning status per credential
              if (query.isAlreadyProvisioned) {
                existing.alreadyProvisionedFor.add(credentialId);
              }
            } else {
              // Create new entry
              queryMap.set(query.id, {
                query,
                alreadyProvisionedFor: query.isAlreadyProvisioned ? new Set([credentialId]) : new Set(),
              });
            }
          }
        }

        setQueriesWithCompatibility(Array.from(queryMap.values()));
      } catch (error) {
        console.error('Failed to load available queries:', error);
        setQueriesWithCompatibility([]);
      } finally {
        setIsLoadingQueries(false);
      }
    };

    loadQueries();
  }, [selectedCredentialIds, applicationId]);

  // Reset query selection when credentials change
  useEffect(() => {
    setSelectedQueryIds([]);
  }, [selectedCredentialIds]);

  const handleCredentialToggle = (credentialId: number) => {
    setSelectedCredentialIds((prev) =>
      prev.includes(credentialId) ? prev.filter((id) => id !== credentialId) : [...prev, credentialId],
    );
    // Reset query selection when credentials change
    setSelectedQueryIds([]);
  };

  const handleQueryToggle = (queryId: number) => {
    setSelectedQueryIds((prev) =>
      prev.includes(queryId) ? prev.filter((id) => id !== queryId) : [...prev, queryId],
    );
  };

  const handleSubmit = () => {
    if (selectedCredentialIds.length === 0 || selectedQueryIds.length === 0) {
      return;
    }
    onSubmit(selectedCredentialIds, selectedQueryIds);
  };

  const isFormValid = selectedCredentialIds.length > 0 && selectedQueryIds.length > 0;

  // Filter to only relational credentials
  const relationalCredentials = credentials.filter((cred) => {
    const type = cred.credentialType;
    return type !== undefined && [1, 4, 5, 6].includes(type); // SqlServer, PostgreSql, MySql, Oracle
  });

  // Calculate preview of what will be created
  const getPreviewCombinations = () => {
    const combinations: Array<{ credential: DatabaseCredentialDto; queries: AvailableHealthQueryDto[] }> = [];

    for (const credentialId of selectedCredentialIds) {
      const credential = credentials.find((c) => c.id === credentialId);
      if (!credential) continue;

      const credentialQueries = queriesWithCompatibility
        .filter(({ query, alreadyProvisionedFor }) =>
          selectedQueryIds.includes(query.id) && !alreadyProvisionedFor.has(credentialId),
        )
        .map(({ query }) => query);

      if (credentialQueries.length > 0) {
        combinations.push({ credential, queries: credentialQueries });
      }
    }

    return combinations;
  };

  const previewCombinations = getPreviewCombinations();
  const totalToCreate = previewCombinations.reduce((sum, c) => sum + c.queries.length, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>فعال‌سازی نظارت سلامت دیتابیس</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Section 1: Credential Selection */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              انتخاب Credentials
            </Typography>
            <Stack spacing={1}>
              {relationalCredentials.map((credential) => (
                <FormControlLabel
                  key={credential.id}
                  control={
                    <Checkbox
                      checked={selectedCredentialIds.includes(credential.id)}
                      onChange={() => handleCredentialToggle(credential.id)}
                      disabled={!credential.isActive}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{credential.name}</Typography>
                      {!credential.isActive && (
                        <Typography variant="caption" color="error">
                          (غیرفعال)
                        </Typography>
                      )}
                    </Box>
                  }
                />
              ))}
            </Stack>
          </Box>

          {/* Section 2: Query Selection */}
          {selectedCredentialIds.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                انتخاب Health Queries
              </Typography>
              {isLoadingQueries ? (
                <LinearProgress />
              ) : queriesWithCompatibility.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  برای این اعتبارنامه هیچ کوئری سلامت سازگاری یافت نشد.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {queriesWithCompatibility.map(({ query, alreadyProvisionedFor }) => {
                    const isAlreadyProvisionedForSelected = selectedCredentialIds.some((id) =>
                      alreadyProvisionedFor.has(id),
                    );
                    const isDisabled = isAlreadyProvisionedForSelected;

                    return (
                      <FormControlLabel
                        key={query.id}
                        control={
                          <Checkbox
                            checked={selectedQueryIds.includes(query.id)}
                            onChange={() => handleQueryToggle(query.id)}
                            disabled={isDisabled}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{query.displayName}</Typography>
                            {isAlreadyProvisionedForSelected && (
                              <Typography variant="caption" color="text.secondary">
                                (قبلاً فعال شده)
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    );
                  })}
                </Stack>
              )}
            </Box>
          )}

          {/* Section 3: Preview */}
          {selectedCredentialIds.length > 0 && selectedQueryIds.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  مواردی که ایجاد خواهند شد
                </Typography>
                {previewCombinations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    هیچ مورد جدیدی برای ایجاد وجود ندارد (همه موارد قبلاً فعال شده‌اند).
                  </Typography>
                ) : (
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Stack spacing={2}>
                      {previewCombinations.map(({ credential, queries }) => (
                        <Box key={credential.id}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} gutterBottom>
                            {credential.name}
                          </Typography>
                          <Stack spacing={0.5} sx={{ pr: 2 }}>
                            {queries.map((query) => (
                              <Stack
                                key={query.id}
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: 'center' }}
                              >
                                <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {query.displayName}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>
                      ))}
                      <Divider />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {totalToCreate} مورد نظارت ایجاد خواهد شد.
                      </Typography>
                    </Stack>
                  </Paper>
                )}
              </Box>
            </>
          )}

          {submitError && <Alert severity="error">{submitError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          انصراف
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || isSubmitting}
        >
          فعال‌سازی
        </Button>
      </DialogActions>
    </Dialog>
  );
}
