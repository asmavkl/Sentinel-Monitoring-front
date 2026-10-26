import { httpClient } from '@/api/httpClient';
import { requestApiData } from '@/api/apiUtils';
import type {
  MultiSeriesMetricHistoryDto,
  MultiSeriesMetricHistoryQuery,
} from '../types/metricHistory';

const CHECKS_PATH = '/api/checks';

export const metricHistoryApi = {
  getMultiSeriesMetricHistory(
    checkId: number,
    query: MultiSeriesMetricHistoryQuery = {},
  ) {
    return requestApiData<MultiSeriesMetricHistoryDto>(() =>
      httpClient.get(`${CHECKS_PATH}/${checkId}/metrics/history`, {
        params: {
          metricIds: query.metricIds,
          from: query.from,
          to: query.to,
          take: query.take,
        },
        paramsSerializer: (params) => {
          return Object.keys(params)
            .filter((key) => {
              const value = params[key as keyof typeof params];
              return value !== undefined && value !== null && value !== '';
            })
            .map((key) => {
              const value = params[key as keyof typeof params];
              if (Array.isArray(value)) {
                return value.map((v) => `${key}=${v}`).join('&');
              }
              return `${key}=${value}`;
            })
            .join('&');
        },
      }),
    );
  },
};
