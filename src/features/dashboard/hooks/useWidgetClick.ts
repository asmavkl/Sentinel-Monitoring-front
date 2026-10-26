import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WidgetDto } from '@/types/dashboard';
import { buildCheckRoute } from '@/routes/paths';
import { useDashboardStore } from '@/store/dashboardStore';
import { getPrimaryCheckId } from '@/utils/widgetDataSource';

export function useWidgetClick() {
  const navigate = useNavigate();
  const setSelectedWidgetId = useDashboardStore((state) => state.setSelectedWidgetId);

  return useCallback(
    (widget: WidgetDto) => {
      const checkId = getPrimaryCheckId(widget.dataSources);
      setSelectedWidgetId(widget.id);

      if (checkId) {
        navigate(buildCheckRoute(checkId));
      }
    },
    [navigate, setSelectedWidgetId],
  );
}
