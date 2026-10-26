import { Alert, Paper, Typography } from '@mui/material';
import type { WidgetComponentProps } from './types';

export function UnknownWidget({ title }: WidgetComponentProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Alert severity="warning">
        <Typography variant="subtitle2">{title}</Typography>
        نوع این ویجت پشتیبانی نمی شود.
      </Alert>
    </Paper>
  );
}
