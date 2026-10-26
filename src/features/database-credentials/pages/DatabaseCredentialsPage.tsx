import AddIcon from '@mui/icons-material/Add';
import { Alert, Button } from '@mui/material';
import { useState } from 'react';
import { getErrorMessage } from '@/api/apiUtils';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import {
  MonitoringEmptyState,
  MonitoringPageContainer,
  MonitoringSectionHeader,
  MonitoringTableCard,
  MonitoringToolbar,
} from '@/components/monitoring/layout';
import { ConfirmDeleteDialog } from '@/features/monitoring-management/components';
import {
  CredentialFormDialog,
  CredentialTable,
  ConnectionTestResult,
  type CredentialDialogMode,
} from '../components';
import {
  useActivateDatabaseCredential,
  useCreateDatabaseCredential,
  useDatabaseCredentials,
  useDeactivateDatabaseCredential,
  useDeleteDatabaseCredential,
  useTestDatabaseCredential,
  useUpdateDatabaseCredential,
} from '../hooks';
import type { CredentialFormSubmitValues } from '../components/CredentialFormDialog';
import { CredentialType } from '@/types/enums';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';
import {
  ADD_CREDENTIAL_LABEL,
  CREDENTIALS_LABEL,
  CREDENTIALS_LOAD_ERROR_TITLE,
  CREDENTIALS_LOADING_MESSAGE,
  DELETE_CREDENTIAL_FALLBACK_MESSAGE,
  DELETE_CREDENTIAL_LABEL,
  EMPTY_CREDENTIALS_DESCRIPTION,
  EMPTY_CREDENTIALS_TITLE,
  deleteCredentialMessage,
} from '../utils/credentialLabels';

function snmpCredentialFields(values: CredentialFormSubmitValues) {
  if (values.credentialType !== CredentialType.Snmp) {
    return {};
  }

  return {
    ...(values.snmpVersion != null ? { snmpVersion: values.snmpVersion } : {}),
    ...(values.snmpAuthenticationProtocol != null
      ? { snmpAuthenticationProtocol: values.snmpAuthenticationProtocol }
      : {}),
    ...(values.snmpPrivacyProtocol != null ? { snmpPrivacyProtocol: values.snmpPrivacyProtocol } : {}),
    ...(values.privacyPassword !== undefined ? { privacyPassword: values.privacyPassword } : {}),
  };
}

// TODO(Phase 3-E-C): Re-enable userHasCredentialWriteAccess when backend roles are finalized.
const canWrite = true;

export function DatabaseCredentialsPage() {
  const credentialsQuery = useDatabaseCredentials();
  const createCredential = useCreateDatabaseCredential();
  const updateCredential = useUpdateDatabaseCredential();
  const deactivateCredential = useDeactivateDatabaseCredential();
  const activateCredential = useActivateDatabaseCredential();
  const deleteCredential = useDeleteDatabaseCredential();
  const testCredential = useTestDatabaseCredential();

  const [formOpen, setFormOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<CredentialDialogMode>('create');
  const [selected, setSelected] = useState<DatabaseCredentialDto | null>(null);
  const [deleting, setDeleting] = useState<DatabaseCredentialDto | null>(null);
  const [tableTestResult, setTableTestResult] = useState<{
    credentialId: number;
    success: boolean;
    message?: string | null;
    durationMs?: number | null;
  } | null>(null);

  const credentials = credentialsQuery.data ?? [];
  const mutationError = createCredential.error ?? updateCredential.error;
  const isSaving = createCredential.isPending || updateCredential.isPending;

  const openCreate = () => {
    setSelected(null);
    setDialogMode('create');
    setFormOpen(true);
    createCredential.reset();
    updateCredential.reset();
  };

  const openDialog = (mode: CredentialDialogMode, credential: DatabaseCredentialDto) => {
    setSelected(credential);
    setDialogMode(mode);
    setFormOpen(true);
    createCredential.reset();
    updateCredential.reset();
  };

  const handleSubmit = async (values: CredentialFormSubmitValues) => {
    try {
      if (dialogMode === 'edit' && selected) {
        await updateCredential.mutateAsync({
          id: selected.id,
          payload: {
            name: values.name,
            server: values.server,
            databaseName: values.databaseName,
            username: values.username,
            password:
              values.credentialType === CredentialType.Snmp
                ? (values.password ?? '')
                : (values.password ?? null),
            port: values.port,
            isActive: values.isActive,
            credentialType: values.credentialType,
            ...snmpCredentialFields(values),
          },
        });
      } else {
        await createCredential.mutateAsync({
          name: values.name,
          server: values.server,
          databaseName: values.databaseName,
          username: values.username,
          password: values.password ?? '',
          port: values.port,
          isActive: values.isActive,
          credentialType: values.credentialType,
          ...snmpCredentialFields(values),
        });
      }

      setFormOpen(false);
      setSelected(null);
    } catch {
      // Shown via mutation error in dialog.
    }
  };

  const handleTableTest = async (credential: DatabaseCredentialDto) => {
    setTableTestResult(null);
    testCredential.reset();

    try {
      const result = await testCredential.mutateAsync(credential.id);
      setTableTestResult({
        credentialId: credential.id,
        success: result.success,
        message: result.message,
        durationMs: result.durationMs,
      });
    } catch (error) {
      setTableTestResult({
        credentialId: credential.id,
        success: false,
        message: getErrorMessage(error),
      });
    }
  };

  const addButton = canWrite ? (
    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
      {ADD_CREDENTIAL_LABEL}
    </Button>
  ) : null;

  if (credentialsQuery.isLoading) {
    return (
      <MonitoringPageContainer>
        <MonitoringSectionHeader title="مدیریت پایش" />
        <MonitoringToolbar title={CREDENTIALS_LABEL} actions={addButton} />
        <DashboardLoading message={CREDENTIALS_LOADING_MESSAGE} />
        <CredentialFormDialog
          open={formOpen}
          mode={dialogMode}
          credential={selected}
          isSubmitting={isSaving}
          submitError={mutationError ? getErrorMessage(mutationError) : null}
          onClose={() => {
            setFormOpen(false);
            setSelected(null);
          }}
          onSubmit={(values) => {
            void handleSubmit(values);
          }}
        />
      </MonitoringPageContainer>
    );
  }

  if (credentialsQuery.isError) {
    return (
      <MonitoringPageContainer>
        <MonitoringSectionHeader title="مدیریت پایش" />
        <MonitoringToolbar title={CREDENTIALS_LABEL} actions={addButton} />
        <DashboardError
          error={credentialsQuery.error}
          title={CREDENTIALS_LOAD_ERROR_TITLE}
          onRetry={() => {
            void credentialsQuery.refetch();
          }}
        />
        <CredentialFormDialog
          open={formOpen}
          mode={dialogMode}
          credential={selected}
          isSubmitting={isSaving}
          submitError={mutationError ? getErrorMessage(mutationError) : null}
          onClose={() => {
            setFormOpen(false);
            setSelected(null);
          }}
          onSubmit={(values) => {
            void handleSubmit(values);
          }}
        />
      </MonitoringPageContainer>
    );
  }

  return (
    <MonitoringPageContainer>
      <MonitoringSectionHeader title="مدیریت پایش" />
      <MonitoringToolbar title={CREDENTIALS_LABEL} actions={addButton} />

      {tableTestResult ? (
        <ConnectionTestResult
          success={tableTestResult.success}
          message={tableTestResult.message}
          durationMs={tableTestResult.durationMs}
        />
      ) : null}

      {deactivateCredential.error || activateCredential.error ? (
        <Alert severity="error">
          {getErrorMessage(deactivateCredential.error ?? activateCredential.error)}
        </Alert>
      ) : null}

      {credentials.length === 0 ? (
        <MonitoringEmptyState
          title={EMPTY_CREDENTIALS_TITLE}
          description={EMPTY_CREDENTIALS_DESCRIPTION}
          action={
            canWrite ? (
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mt: 1 }}>
                {ADD_CREDENTIAL_LABEL}
              </Button>
            ) : null
          }
        />
      ) : (
        <MonitoringTableCard>
          <CredentialTable
            credentials={credentials}
            canWrite={canWrite}
            testingId={testCredential.isPending ? testCredential.variables : null}
            togglingId={
              deactivateCredential.isPending
                ? deactivateCredential.variables
                : activateCredential.isPending
                  ? activateCredential.variables
                  : null
            }
            onView={(item) => openDialog('view', item)}
            onEdit={(item) => openDialog('edit', item)}
            onDelete={(item) => {
              deleteCredential.reset();
              setDeleting(item);
            }}
            onToggleActive={(item) => {
              deactivateCredential.reset();
              activateCredential.reset();
              if (item.isActive) {
                void deactivateCredential.mutateAsync(item.id);
                return;
              }

              void activateCredential.mutateAsync(item.id);
            }}
            onTestConnection={(item) => {
              void handleTableTest(item);
            }}
          />
        </MonitoringTableCard>
      )}

      <CredentialFormDialog
        open={formOpen}
        mode={dialogMode}
        credential={selected}
        isSubmitting={isSaving}
        submitError={mutationError ? getErrorMessage(mutationError) : null}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        onSubmit={(values) => {
          void handleSubmit(values);
        }}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        title={DELETE_CREDENTIAL_LABEL}
        message={
          deleting ? deleteCredentialMessage(deleting.name) : DELETE_CREDENTIAL_FALLBACK_MESSAGE
        }
        isDeleting={deleteCredential.isPending}
        error={deleteCredential.error ? getErrorMessage(deleteCredential.error) : null}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) {
            return;
          }

          void deleteCredential.mutateAsync(deleting.id).then(() => {
            setDeleting(null);
          });
        }}
      />
    </MonitoringPageContainer>
  );
}
