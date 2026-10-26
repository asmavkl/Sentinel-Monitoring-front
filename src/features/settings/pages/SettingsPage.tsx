import { Stack, Switch, Typography, FormControlLabel, Paper } from '@mui/material';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

export function SettingsPage() {
  const colorMode = useUiStore((state) => state.colorMode);
  const toggleColorMode = useUiStore((state) => state.toggleColorMode);
  const isEditMode = useDashboardStore((state) => state.isEditMode);
  const toggleEditMode = useDashboardStore((state) => state.toggleEditMode);

  return (
    <Stack spacing={3}>
      <Typography variant="h4">تنظیمات</Typography>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={colorMode === 'dark'}
                onChange={() => toggleColorMode()}
              />
            }
            label="حالت تاریک"
          />
          <FormControlLabel
            control={<Switch checked={isEditMode} onChange={() => toggleEditMode()} />}
            label="حالت ویرایش داشبورد (پیش نمایش)"
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
