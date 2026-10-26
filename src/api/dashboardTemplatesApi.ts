import { httpClient } from '@/api/httpClient';
import { requestApiData } from '@/api/apiUtils';
import type { DashboardTemplateDto } from '@/types/dashboard';

const TEMPLATES_PATH = '/api/dashboard-templates';

export const dashboardTemplatesApi = {
  getTemplates() {
    return requestApiData<DashboardTemplateDto[]>(() => httpClient.get(TEMPLATES_PATH));
  },
};
