import { alpha, Box, Stack, Typography } from '@mui/material';
import type { DashboardSectionDto, WidgetDto } from '@/types/dashboard';
import { resolveSectionColor } from '@/features/dashboard-designer/utils/sectionDraft';
import { WidgetGrid } from './WidgetGrid';

interface DashboardSectionRendererProps {
  section: DashboardSectionDto;
  onWidgetClick?: (widget: WidgetDto) => void;
  onConfigureServerMetric?: (metricDefinitionId: number) => void;
  onConfigureServerAlert?: (metricDefinitionId: number) => void;
  onOpenServerMetricDetails?: (metricDefinitionId: number) => void;
}

function getSectionColorValue(color: string): string {
  const normalized = color.trim().toLowerCase();

  const colors: Record<string, string> = {
    blue: '#3F978E',
    purple: '#8F65B8',
    gray: '#64748B',
    grey: '#64748B',
    green: '#4CAF7D',
    orange: '#D9903D',
    red: '#C85C5C',
    teal: '#3F978E',
  };

  const resolvedColor = colors[normalized];

  if (resolvedColor) {
    return resolvedColor;
  }

  if (color.startsWith('#') || color.startsWith('rgb(') || color.startsWith('rgba(') || color.startsWith('hsl(') || color.startsWith('hsla(')) {
    return color;
  }

  return '#64748B';
}

export function DashboardSectionRenderer({
  section,
  onWidgetClick,
  onConfigureServerMetric,
  onConfigureServerAlert,
  onOpenServerMetricDetails,
}: DashboardSectionRendererProps) {
  if (section.isVisible === false) {
    return null;
  }

  const widgets = section.widgets ?? [];
  const resolvedColor = resolveSectionColor(section.color);
  const headerColor = getSectionColorValue(resolvedColor);

  return (
    <Box
      component="section"
      data-testid="dashboard-section"
      data-section-id={section.id}
      aria-label={section.title}
      sx={(theme) => ({
        bgcolor: 'transparent',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: theme.palette.divider,
        overflow: 'hidden',
        transition: 'border-color 160ms ease, background-color 160ms ease',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.35),
        },
      })}
    >
      <Stack spacing={1.5}>
        <Box
          sx={(theme) => ({
            position: 'relative',
            direction: 'rtl',
            background: theme.palette.mode === 'dark' ? alpha(headerColor, 0.14) : alpha(headerColor, 0.07),
            borderBottom: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? alpha(headerColor, 0.22) : alpha(headerColor, 0.14),
          })}
        >
          {/* Section Accent Bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: 3,
              bgcolor: headerColor,
            }}
          />

          <Stack
            direction="row"
            spacing={1}
            sx={{
              minHeight: 52,
              alignItems: 'center',
              px: { xs: 1.25, sm: 1.75 },
              py: 0.75,
              pl: { xs: 1.5, sm: 2 },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <Stack spacing={0.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {section.title}
                </Typography>
                {section.description ? (
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                    {section.description}
                  </Typography>
                ) : null}
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ px: { xs: 1, sm: 1.5 }, pt: 0.5, pb: 1.5 }}>
          <WidgetGrid
            mode="view"
            widgets={widgets}
            emptyDescription="ویجتی در این بخش تعریف نشده است."
            onWidgetExpand={onWidgetClick}
            onConfigureServerMetric={onConfigureServerMetric}
            onConfigureServerAlert={onConfigureServerAlert}
            onOpenServerMetricDetails={onOpenServerMetricDetails}
          />
        </Box>
      </Stack>
    </Box>
  );
}
