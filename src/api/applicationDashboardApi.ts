import { httpClient } from '@/api/httpClient';
import { requestApiData, toApiError } from '@/api/apiUtils';
import type {
  CreateWidgetRequestDto,
  DashboardLayoutDto,
  UpdateWidgetRequestDto,
  WidgetDto,
} from '@/types/dashboard';
import { normalizeDashboardLayout } from '@/utils/dashboardLayout';

function dashboardPath(applicationId: number): string {
  return `/api/applications/${applicationId}/dashboard`;
}

export const applicationDashboardApi = {
  async getDashboard(applicationId: number): Promise<DashboardLayoutDto> {
    const raw = await requestApiData<Partial<DashboardLayoutDto>>(() =>
      httpClient.get(dashboardPath(applicationId)),
    );
    return normalizeDashboardLayout(raw);
  },

  async getLayout(applicationId: number): Promise<DashboardLayoutDto> {
    const raw = await requestApiData<Partial<DashboardLayoutDto>>(() =>
      httpClient.get(`${dashboardPath(applicationId)}/layout`),
    );
    return normalizeDashboardLayout(raw);
  },

  createWidget(applicationId: number, payload: CreateWidgetRequestDto) {
    return requestApiData<WidgetDto>(() =>
      httpClient.post(`${dashboardPath(applicationId)}/widgets`, payload),
    );
  },

  updateWidget(applicationId: number, widgetId: number, payload: UpdateWidgetRequestDto) {
    return requestApiData<WidgetDto>(() =>
      httpClient.put(`${dashboardPath(applicationId)}/widgets/${widgetId}`, payload),
    );
  },

  async deleteWidget(applicationId: number, widgetId: number): Promise<void> {
    try {
      await httpClient.delete(`${dashboardPath(applicationId)}/widgets/${widgetId}`);
    } catch (error) {
      throw toApiError(error);
    }
  },
};
