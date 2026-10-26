import { FormControlLabel, Switch } from '@mui/material';
import { useDashboardStore } from '@/store/dashboardStore';

export function AutoRefreshToggle() {
  const autoRefreshEnabled = useDashboardStore((state) => state.autoRefreshEnabled);
  const setAutoRefreshEnabled = useDashboardStore((state) => state.setAutoRefreshEnabled);

  return (
    <FormControlLabel
      control={
        <Switch
          checked={autoRefreshEnabled}
          onChange={(event) => setAutoRefreshEnabled(event.target.checked)}
          aria-label="بروزرسانی خودکار"
        />
      }
      label={autoRefreshEnabled ? 'بروزرسانی خودکار: فعال' : 'بروزرسانی خودکار: غیرفعال'}
    />
  );
}
