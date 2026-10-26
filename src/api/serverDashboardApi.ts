import { httpClient } from '@/api/httpClient';
import { requestApiData, toApiError } from '@/api/apiUtils';
import type {
  CreateWidgetRequestDto,
  DashboardLayoutDto,
  UpdateWidgetRequestDto,
  WidgetDto,
} from '@/types/dashboard';
import { normalizeDashboardLayout } from '@/utils/dashboardLayout';

function dashboardPath(serverId: number): string {
  return `/api/monitored-servers/${serverId}/dashboard`;
}

export const serverDashboardApi = {
  async getDashboard(serverId: number): Promise<DashboardLayoutDto> {
    const raw = await requestApiData<Partial<DashboardLayoutDto>>(() =>
      httpClient.get(dashboardPath(serverId)),
    );
    return normalizeDashboardLayout(raw);
  },

  async getLayout(serverId: number): Promise<DashboardLayoutDto> {
    const raw = await requestApiData<Partial<DashboardLayoutDto>>(() =>
      httpClient.get(`${dashboardPath(serverId)}/layout`),
    );
    return normalizeDashboardLayout(raw);
  },

  createWidget(serverId: number, payload: CreateWidgetRequestDto) {
    return requestApiData<WidgetDto>(() =>
      httpClient.post(`${dashboardPath(serverId)}/widgets`, payload),
    );
  },

  updateWidget(serverId: number, widgetId: number, payload: UpdateWidgetRequestDto) {
    return requestApiData<WidgetDto>(() =>
      httpClient.put(`${dashboardPath(serverId)}/widgets/${widgetId}`, payload),
    );
  },

  async deleteWidget(serverId: number, widgetId: number): Promise<void> {
    try {
      await httpClient.delete(`${dashboardPath(serverId)}/widgets/${widgetId}`);
    } catch (error) {
      throw toApiError(error);
    }
  },
};
