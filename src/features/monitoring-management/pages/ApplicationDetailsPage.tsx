import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getErrorMessage } from '@/api/apiUtils';
import { userHasMonitoringWriteAccess } from '@/auth';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import { BackButton } from '@/components/common';
import {
  MonitoringEmptyState,
  MonitoringPageContainer,
  MonitoringSectionHeader,
  MonitoringTableCard,
  MonitoringToolbar,
} from '@/components/monitoring/layout';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { ApplicationInfoCard } from '../components/ApplicationInfoCard';
import { ComponentFormDialog, type ComponentFormValues } from '../components/ComponentFormDialog';
import { ComponentList } from '../components/ComponentList';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import {
  useApplicationComponents,
  useCreateApplicationComponent,
  useDeleteApplicationComponent,
  useMonitoringApplication,
  useUpdateApplicationComponent,
} from '../hooks';
import { buildComponentCode } from '../utils/formValidation';
import { ROUTES } from '@/routes/paths';
import type { MonitoringComponentDto } from '@/types/monitoringManagement';
import {
  AddHealthCheckDialog,
  ProvisionDialog,
  ProvisionResultsDialog,
  ProvisionedChecksTable,
} from '@/features/database-health-monitoring/components';
import {
  useAddDatabaseHealthMonitoring,
  useProvisionDatabaseHealthMonitoring,
} from '@/features/database-health-monitoring/hooks';
import { useDatabaseCredentials } from '@/features/database-credentials/hooks';
import { useDatabaseHealthQueries } from '@/features/database-health-queries/hooks';

export function ApplicationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const applicationId = Number(id);
  const { data: currentUser } = useCurrentUser();
  const canWrite = userHasMonitoringWriteAccess(currentUser);

  const applicationQuery = useMonitoringApplication(applicationId);
  const componentsQuery = useApplicationComponents(applicationId);
  const createComponent = useCreateApplicationComponent();
  const updateComponent = useUpdateApplicationComponent();
  const deleteComponent = useDeleteApplicationComponent();

  // Database Health Monitoring
  const { data: credentials } = useDatabaseCredentials();
  const { data: healthQueries } = useDatabaseHealthQueries({ isActive: true });
  const provisionMutation = useProvisionDatabaseHealthMonitoring(applicationId);
  const addMutation = useAddDatabaseHealthMonitoring(applicationId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MonitoringComponentDto | null>(null);
  const [deleting, setDeleting] = useState<MonitoringComponentDto | null>(null);

  // Database Health Monitoring dialogs
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [selectedCredentialIds, setSelectedCredentialIds] = useState<number[]>([]);
  const [selectedQueryIds, setSelectedQueryIds] = useState<number[]>([]);

  const mutationError = createComponent.error ?? updateComponent.error;
  const isSaving = createComponent.isPending || updateComponent.isPending;

  if (!applicationId || Number.isNaN(applicationId)) {
    return (
      <MonitoringEmptyState
        title="شناسه سامانه نامعتبر است"
        action={<BackButton fallbackTo={ROUTES.monitoringApplications} />}
      />
    );
  }

  if (applicationQuery.isLoading) {
    return (
      <MonitoringPageContainer>
        <BackButton fallbackTo={ROUTES.monitoringApplications} />
        <MonitoringSectionHeader title="جزئیات سامانه" />
        <DashboardLoading message="در حال بارگذاری سامانه..." />
      </MonitoringPageContainer>
    );
  }

  if (applicationQuery.isError || !applicationQuery.data) {
    return (
      <MonitoringPageContainer>
        <BackButton fallbackTo={ROUTES.monitoringApplications} />
        <MonitoringSectionHeader title="جزئیات سامانه" />
        <DashboardError
          error={applicationQuery.error}
          title="امکان بارگذاری سامانه وجود ندارد"
          onRetry={() => {
            void applicationQuery.refetch();
          }}
        />
      </MonitoringPageContainer>
    );
  }

  const application = applicationQuery.data;
  const components = componentsQuery.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
    createComponent.reset();
    updateComponent.reset();
  };

  const handleSubmit = async (values: ComponentFormValues) => {
    try {
      if (editing) {
        await updateComponent.mutateAsync({
          applicationId,
          componentId: editing.id,
          payload: {
            name: values.name,
            description: values.description || null,
            isActive: values.isActive,
          },
        });
      } else {
        await createComponent.mutateAsync({
          applicationId,
          name: values.name,
          code: buildComponentCode(
            values.name,
            components.map((item) => item.code),
          ),
          description: values.description || null,
          isActive: values.isActive,
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      // Shown via mutation error.
    }
  };

  // Database Health Monitoring handlers
  const handleProvision = async (credentialIds: number[], healthQueryIds: number[]) => {
    try {
      await provisionMutation.mutateAsync({
        databaseCredentialIds: credentialIds,
        databaseHealthQueryIds: healthQueryIds,
      });
      setSelectedCredentialIds(credentialIds);
      setSelectedQueryIds(healthQueryIds);
      setProvisionOpen(false);
      setResultsOpen(true);
    } catch {
      // Shown via mutation error
    }
  };

  const handleAdd = async (credentialId: number, healthQueryIds: number[]) => {
    try {
      await addMutation.mutateAsync({
        databaseCredentialIds: [credentialId],
        databaseHealthQueryIds: healthQueryIds,
      });
      setSelectedCredentialIds([credentialId]);
      setSelectedQueryIds(healthQueryIds);
      setAddOpen(false);
      setResultsOpen(true);
    } catch {
      // Shown via mutation error
    }
  };

  return (
    <MonitoringPageContainer>
      <BackButton fallbackTo={ROUTES.monitoringApplications} />
      <MonitoringSectionHeader title={application.name} />
      <MonitoringToolbar
        title="اجزای برنامه"
        actions={
          canWrite ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              افزودن مولفه
            </Button>
          ) : undefined
        }
      />

      <ApplicationInfoCard application={application} />

      <MonitoringTableCard title="مولفه‌ها">
        {componentsQuery.isLoading ? (
          <DashboardLoading message="در حال بارگذاری مولفه‌ها..." />
        ) : componentsQuery.isError ? (
          <DashboardError
            error={componentsQuery.error}
            title="امکان بارگذاری مولفه‌ها وجود ندارد"
            onRetry={() => {
              void componentsQuery.refetch();
            }}
          />
        ) : (
          <ComponentList
            components={components}
            canWrite={canWrite}
            onEdit={(component) => {
              setEditing(component);
              setFormOpen(true);
              createComponent.reset();
              updateComponent.reset();
            }}
            onDelete={(component) => {
              deleteComponent.reset();
              setDeleting(component);
            }}
          />
        )}
      </MonitoringTableCard>

      {/* Database Health Monitoring Section */}
      <MonitoringSectionHeader title="مانیتورینگ کوئری های سلامت " />
      <MonitoringTableCard>
        <ProvisionedChecksTable
          applicationId={applicationId}
          actions={
            canWrite ? (
              <>
                <Button variant="outlined" onClick={() => setAddOpen(true)}>
                  افزودن کوئری سلامت
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setProvisionOpen(true)}>
                  + افزودن نظارت دیتابیس
                </Button>
              </>
            ) : undefined
          }
          onProvision={canWrite ? () => setProvisionOpen(true) : undefined}
        />
      </MonitoringTableCard>

      <ComponentFormDialog
        open={formOpen}
        component={editing}
        existingNames={components.map((item) => item.name)}
        isSubmitting={isSaving}
        submitError={mutationError ? getErrorMessage(mutationError) : null}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={(values) => {
          void handleSubmit(values);
        }}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        title="حذف مولفه"
        message={
          deleting
            ? `مولفه «${deleting.name}» حذف شود؟ این عملیات قابل بازگشت نیست.`
            : 'این مولفه حذف شود؟'
        }
        isDeleting={deleteComponent.isPending}
        error={deleteComponent.error ? getErrorMessage(deleteComponent.error) : null}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) {
            return;
          }

          void deleteComponent
            .mutateAsync({ applicationId, componentId: deleting.id })
            .then(() => {
              setDeleting(null);
            });
        }}
      />

      {/* Database Health Monitoring Dialogs */}
      <ProvisionDialog
        open={provisionOpen}
        applicationId={applicationId}
        credentials={credentials ?? []}
        isSubmitting={provisionMutation.isPending}
        submitError={provisionMutation.error ? getErrorMessage(provisionMutation.error) : null}
        onClose={() => setProvisionOpen(false)}
        onSubmit={handleProvision}
      />

      <AddHealthCheckDialog
        open={addOpen}
        applicationId={applicationId}
        credentials={credentials ?? []}
        isSubmitting={addMutation.isPending}
        submitError={addMutation.error ? getErrorMessage(addMutation.error) : null}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
      />

      <ProvisionResultsDialog
        open={resultsOpen}
        result={provisionMutation.data ?? addMutation.data ?? null}
        selectedCredentials={credentials?.filter((c) => selectedCredentialIds.includes(c.id)) ?? []}
        selectedQueries={healthQueries?.filter((q) => selectedQueryIds.includes(q.id)) ?? []}
        onClose={() => setResultsOpen(false)}
      />
    </MonitoringPageContainer>
  );
}
