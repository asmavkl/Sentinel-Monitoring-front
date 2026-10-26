import {
  Alert,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import type { ComponentStatusDto, DashboardSectionDto, WidgetDto } from '@/types/dashboard';
import type { ServerMetricDefinitionDto } from '@/types/monitoredServers';
import type { WidgetDataSourceRequestDto } from '@/types/widgets';
import { EmptyState } from '@/components/common';
import { DataSourceSelector } from './DataSourceSelector';
import { ServerMetricSourceSelector } from './ServerMetricSourceSelector';
import { ProgressBarSourceEditor } from './ProgressBarSourceEditor';
import { ServerProgressBarSourceEditor } from './ServerProgressBarSourceEditor';
import { WidgetConfigurator } from './WidgetConfigurator';
import { SectionEditor } from './sections/SectionEditor';
import type { CheckOption } from '../utils/checkOptions';
import { useDashboardStore } from '@/store/dashboardStore';
import { multiSeriesChartSourceError, progressBarSourceError, toDataSourceRequests } from '../utils/widgetDraft';

interface WidgetPropertiesPanelProps {
  widget: WidgetDto | null;
  section: DashboardSectionDto | null;
  sections: DashboardSectionDto[];
  applicationName?: string;
  serverName?: string;
  availableChecks: CheckOption[];
  components?: ComponentStatusDto[];
  serverMetrics?: ServerMetricDefinitionDto[];
  isServerMode?: boolean;
  onWidgetChange: (patch: Partial<WidgetDto>) => void;
  onSectionChange: (patch: Partial<DashboardSectionDto>) => void;
}

export function WidgetPropertiesPanel({
  widget,
  section,
  sections,
  applicationName,
  availableChecks,
  components,
  serverMetrics,
  isServerMode,
  onWidgetChange,
  onSectionChange,
}: WidgetPropertiesPanelProps) {
  const propertiesTab = useDashboardStore((state) => state.propertiesTab);
  const setPropertiesTab = useDashboardStore((state) => state.setPropertiesTab);
  const serverMode = isServerMode ?? (serverMetrics != null);
  const metricSourceError = widget
    ? (progressBarSourceError(widget) ?? multiSeriesChartSourceError(widget))
    : null;

  return (
    <Card variant="outlined" sx={{ height: '100%' }} data-testid="widget-properties-panel">
      <CardContent>
        <Stack spacing={2}>
          {widget ? (
            <>
              {metricSourceError ? <Alert severity="warning">{metricSourceError}</Alert> : null}
              <Tabs
                value={propertiesTab}
                onChange={(_event, value: number) => setPropertiesTab(value)}
              >
                <Tab label="تنظیمات" />
                <Tab label="منبع داده" />
              </Tabs>

              {propertiesTab === 0 ? (
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel id="widget-section-label">بخش</InputLabel>
                    <Select
                      labelId="widget-section-label"
                      label="بخش"
                      value={widget.sectionId == null ? '' : String(widget.sectionId)}
                      onChange={(event) =>
                        onWidgetChange({ sectionId: event.target.value ? Number(event.target.value) : null })
                      }
                      inputProps={{ 'aria-label': 'بخش ویجت' }}
                    >
                      {sections.map((item) => (
                        <MenuItem key={item.id} value={String(item.id)}>
                          {item.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <WidgetConfigurator
                    widgetType={widget.widgetType}
                    title={widget.title}
                    description={widget.description}
                    configuration={widget.configuration}
                    onTitleChange={(title) => onWidgetChange({ title })}
                    onDescriptionChange={(description) => onWidgetChange({ description })}
                    onConfigurationChange={(configuration) => onWidgetChange({ configuration })}
                  />
                </Stack>
              ) : serverMode ? (
                widget.widgetType === 'ProgressBar' ? (
                  <ServerProgressBarSourceEditor
                    serverMetrics={serverMetrics ?? []}
                    dataSources={toDataSourceRequests(widget.dataSources, { server: true })}
                    configuration={widget.configuration}
                    onChange={({ dataSources, configuration }) =>
                      onWidgetChange({
                        configuration,
                        dataSources: dataSources.map((source, index) =>
                          toWidgetDataSource(source, widget, index, true, undefined),
                        ),
                      })
                    }
                  />
                ) : (
                  <ServerMetricSourceSelector
                    metrics={serverMetrics ?? []}
                    allowMultiple={widget.widgetType === 'MultiSeriesChart'}
                    dataSources={toDataSourceRequests(widget.dataSources, { server: true })}
                    onChange={(dataSources) =>
                      onWidgetChange({
                        dataSources: dataSources.map((source, index) =>
                          toWidgetDataSource(source, widget, index, true, undefined),
                        ),
                      })
                    }
                  />
                )
              ) : widget.widgetType === 'ProgressBar' ? (
                <ProgressBarSourceEditor
                  applicationName={applicationName}
                  availableChecks={availableChecks}
                  components={components}
                  dataSources={toDataSourceRequests(widget.dataSources)}
                  savedSources={widget.dataSources}
                  configuration={widget.configuration}
                  onChange={({ dataSources, configuration }) =>
                    onWidgetChange({
                      configuration,
                      dataSources: dataSources.map((source, index) =>
                        toWidgetDataSource(source, widget, index, false, undefined),
                      ),
                    })
                  }
                />
              ) : (
                <DataSourceSelector
                  applicationName={applicationName}
                  availableChecks={availableChecks}
                  components={components}
                  dataSources={toDataSourceRequests(widget.dataSources)}
                  dataSourceType={widget.dataSources[0]?.dataSourceType as any}
                  requireMetric={widget.widgetType === 'MultiSeriesChart'}
                  onChange={(dataSources, dataSourceType) =>
                    onWidgetChange({
                      dataSources: dataSources.map((source, index) =>
                        toWidgetDataSource(source, widget, index, false, dataSourceType),
                      ),
                    })
                  }
                />
              )}
            </>
          ) : section ? (
            <SectionEditor section={section} onChange={onSectionChange} />
          ) : (
            <EmptyState
              title="موردی انتخاب نشده است"
              description="روی یک ویجت دبل‌کلیک کنید یا آیکون چرخ‌دنده را بزنید."
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function toWidgetDataSource(
  source: WidgetDataSourceRequestDto,
  widget: WidgetDto,
  index: number,
  server = false,
  dataSourceType?: 'Metric' | 'Dataset',
) {
  if (server) {
    const metricId = source.serverMetricDefinitionId;
    const existing = widget.dataSources.find(
      (item) => item.serverMetricDefinitionId === metricId,
    );

    return {
      id: existing?.id ?? 0,
      checkId: null,
      serverMetricDefinitionId: metricId,
      metricDefinitionId: metricId,
      metricId,
      metricName: source.metricName ?? existing?.metricName,
      metricDisplayName: existing?.metricDisplayName,
      displayOrder: source.displayOrder ?? index,
      value: existing?.value,
      timestamp: existing?.timestamp,
      healthStatus: existing?.healthStatus,
      history: existing?.history,
    };
  }

  const metricId = source.metricDefinitionId;
  const existing =
    widget.dataSources.find((item) => {
      const itemMetricId = item.metricDefinitionId ?? item.metricId;
      return item.checkId === source.checkId && metricId != null && itemMetricId === metricId;
    }) ??
    (widget.dataSources.filter((item) => item.checkId === source.checkId).length === 1
      ? widget.dataSources.find((item) => item.checkId === source.checkId)
      : undefined);

  return {
    id: existing?.id ?? 0,
    checkId: source.checkId,
    checkName: existing?.checkName ?? existing?.status?.name,
    metricName: source.metricName ?? undefined,
    metricDefinitionId: source.metricDefinitionId ?? undefined,
    displayOrder: source.displayOrder ?? index,
    status: existing?.status,
    dataSourceType: dataSourceType ?? source.dataSourceType,
  };
}
