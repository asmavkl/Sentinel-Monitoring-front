import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
} from '@mui/material';
import { useState } from 'react';
import type { WidgetConfiguration, WidgetDataSourceRequestDto, WidgetType } from '@/types/widgets';
import { WIDGET_TYPE_LABELS } from '@/types/widgets';
import type { ComponentStatusDto, DashboardSectionDto } from '@/types/dashboard';
import { DataSourceSelector } from './DataSourceSelector';
import { ProgressBarSourceEditor } from './ProgressBarSourceEditor';
import { WidgetConfigurator } from './WidgetConfigurator';
import type { CheckOption } from '../utils/checkOptions';
import { getDefaultConfiguration, getDefaultTitle } from '../utils/widgetConfigurationForm';
import { hasMetricIdentity } from '../utils/widgetDraft';

interface AddWidgetDialogProps {
  open: boolean;
  widgetType: WidgetType | null;
  sections: DashboardSectionDto[];
  selectedSectionId?: number | null;
  applicationName?: string;
  availableChecks: CheckOption[];
  components?: ComponentStatusDto[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (input: {
    dashboardSectionId: number;
    title: string;
    description: string;
    configuration: WidgetConfiguration;
    dataSources: WidgetDataSourceRequestDto[];
  }) => void;
}

function AddWidgetForm({
  widgetType,
  sections,
  selectedSectionId,
  applicationName,
  availableChecks,
  components,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  widgetType: WidgetType;
  sections: DashboardSectionDto[];
  selectedSectionId?: number | null;
  applicationName?: string;
  availableChecks: CheckOption[];
  components?: ComponentStatusDto[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: AddWidgetDialogProps['onSubmit'];
}) {
  const defaultSectionId =
    selectedSectionId && sections.some((section) => section.id === selectedSectionId)
      ? selectedSectionId
      : (sections[0]?.id ?? null);

  const [tab, setTab] = useState(0);
  const [sectionId, setSectionId] = useState<number | null>(defaultSectionId);
  const [title, setTitle] = useState(getDefaultTitle(widgetType));
  const [description, setDescription] = useState('');
  const [configuration, setConfiguration] = useState<WidgetConfiguration>(
    getDefaultConfiguration(widgetType),
  );
  const [dataSources, setDataSources] = useState<WidgetDataSourceRequestDto[]>([]);

  const metricReady =
    (widgetType !== 'MultiSeriesChart' && widgetType !== 'ProgressBar') ||
    (dataSources.length > 0 && dataSources.every((source) => hasMetricIdentity(source)));
  const canSubmit =
    sectionId != null && title.trim().length > 0 && dataSources.length > 0 && metricReady && !isSubmitting;

  return (
    <>
      <DialogTitle>افزودن {WIDGET_TYPE_LABELS[widgetType]}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
          <InputLabel id="add-widget-section-label">بخش مقصد</InputLabel>
          <Select
            labelId="add-widget-section-label"
            label="بخش مقصد"
            value={sectionId == null ? '' : String(sectionId)}
            onChange={(event) => setSectionId(Number(event.target.value))}
            inputProps={{ 'aria-label': 'بخش مقصد' }}
          >
            {sections.map((section) => (
              <MenuItem key={section.id} value={String(section.id)}>
                {section.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tabs value={tab} onChange={(_event, value: number) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label="پیکربندی" />
          <Tab label="منبع داده" />
        </Tabs>

        {tab === 0 ? (
          <WidgetConfigurator
            widgetType={widgetType}
            title={title}
            description={description}
            configuration={configuration}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onConfigurationChange={setConfiguration}
          />
        ) : widgetType === 'ProgressBar' ? (
            <ProgressBarSourceEditor
              applicationName={applicationName}
              availableChecks={availableChecks}
              components={components}
              dataSources={dataSources}
              configuration={configuration}
              onChange={(next) => {
                setDataSources(next.dataSources);
                setConfiguration(next.configuration);
              }}
            />
          ) : (
            <DataSourceSelector
              applicationName={applicationName}
              availableChecks={availableChecks}
              components={components}
              dataSources={dataSources}
              requireMetric={widgetType === 'MultiSeriesChart'}
              onChange={(nextDataSources) => {
                setDataSources(nextDataSources);
              }}
            />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          انصراف
        </Button>
        <Button
          variant="contained"
          disabled={!canSubmit}
          onClick={() => {
            if (sectionId == null) {
              return;
            }

            onSubmit({
              dashboardSectionId: sectionId,
              title: title.trim(),
              description: description.trim(),
              configuration,
              dataSources,
            });
          }}
        >
          {isSubmitting ? 'در حال ایجاد...' : 'ایجاد ویجت'}
        </Button>
      </DialogActions>
    </>
  );
}

export function AddWidgetDialog({
  open,
  widgetType,
  sections,
  selectedSectionId,
  applicationName,
  availableChecks,
  components,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AddWidgetDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {widgetType ? (
        <AddWidgetForm
          key={`${widgetType}-${selectedSectionId ?? 'none'}`}
          widgetType={widgetType}
          sections={sections}
          selectedSectionId={selectedSectionId}
          applicationName={applicationName}
          availableChecks={availableChecks}
          components={components}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}
