import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import type { MonitoringComponentDto } from '@/types/monitoringManagement';

interface ComponentListProps {
  components: MonitoringComponentDto[];
  canWrite?: boolean;
  onEdit: (component: MonitoringComponentDto) => void;
  onDelete: (component: MonitoringComponentDto) => void;
}

export function ComponentList({
  components,
  canWrite = false,
  onEdit,
  onDelete,
}: ComponentListProps) {
  if (components.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ px: 2, py: 2 }}
        data-testid="component-empty-state"
      >
        برای این سامانه هنوز مولفه‌ای تعریف نشده است
      </Typography>
    );
  }

  return (
    <Box
      data-testid="component-list"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        p: 1.5,
      }}
    >
      {components.map((component) => (
        <Paper
          key={component.id}
          variant="outlined"
          sx={{
            minWidth: 140,
            maxWidth: 220,
            flex: '1 1 140px',
            p: 1,
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{component.name}</Typography>
              <Chip
                size="small"
                label={component.isActive ? 'فعال' : 'غیرفعال'}
                color={component.isActive ? 'success' : 'default'}
              />
            </Stack>
            {component.description ? (
              <Typography variant="body2" color="text.secondary">
                {component.description}
              </Typography>
            ) : null}
            {canWrite ? (
              <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                <Tooltip title="ویرایش">
                  <IconButton
                    size="small"
                    aria-label={`ویرایش ${component.name}`}
                    onClick={() => onEdit(component)}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="حذف">
                  <IconButton
                    size="small"
                    aria-label={`حذف ${component.name}`}
                    onClick={() => onDelete(component)}
                  >
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            ) : null}
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}
