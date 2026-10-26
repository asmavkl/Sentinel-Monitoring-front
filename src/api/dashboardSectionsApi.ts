import { httpClient } from '@/api/httpClient';
import { requestApiData, toApiError } from '@/api/apiUtils';
import type {
  CreateSectionRequestDto,
  DashboardSectionDto,
  UpdateSectionRequestDto,
} from '@/types/dashboard';

function sectionsPath(dashboardId: number): string {
  return `/api/dashboards/${dashboardId}/sections`;
}

export const dashboardSectionsApi = {
  getSections(dashboardId: number) {
    return requestApiData<DashboardSectionDto[]>(() => httpClient.get(sectionsPath(dashboardId)));
  },

  createSection(dashboardId: number, payload: CreateSectionRequestDto) {
    return requestApiData<DashboardSectionDto>(() =>
      httpClient.post(sectionsPath(dashboardId), payload),
    );
  },

  updateSection(_dashboardId: number, sectionId: number, payload: UpdateSectionRequestDto) {
    return requestApiData<DashboardSectionDto>(() =>
      httpClient.put(`/api/dashboard/sections/${sectionId}`, payload),
    );
  },

  async deleteSection(_dashboardId: number, sectionId: number): Promise<void> {
    try {
      await httpClient.delete(`/api/dashboard/sections/${sectionId}`);
    } catch (error) {
      throw toApiError(error);
    }
  },
};
