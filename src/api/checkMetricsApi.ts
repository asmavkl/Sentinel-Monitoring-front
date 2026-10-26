import { httpClient } from '@/api/httpClient';
import { requestApiData } from '@/api/apiUtils';
import type {
  CheckMetricDefinitionDto,
  MetricAggregateDto,
  MetricAggregateQuery,
  MetricHistoryQuery,
  MetricLatestDto,
  MetricTimeSeriesPointDto,
} from '@/types/metrics';
import type {
  MultiSeriesMetricHistoryDto,
  MultiSeriesMetricHistoryQuery,
} from '@/features/dashboard/types/metricHistory';

const CHECKS_PATH = '/api/checks';

export const checkMetricsApi = {
  getMetricDefinitions(checkId: number, applicationId?: number) {
    return requestApiData<CheckMetricDefinitionDto[]>(() =>
      httpClient.get(`${CHECKS_PATH}/${checkId}/metrics/definitions`, {
        params: applicationId ? { applicationId } : undefined,
      }),
    );
  },

  getMetricLatest(checkId: number, metricId: number, applicationId?: number) {
    return requestApiData<MetricLatestDto>(() =>
      httpClient.get(`${CHECKS_PATH}/${checkId}/metrics/${metricId}/latest`, {
        params: applicationId ? { applicationId } : undefined,
      }),
    );
  },

  getMetricHistory(checkId: number, metricId: number, query: MetricHistoryQuery = {}) {
    return requestApiData<MetricTimeSeriesPointDto[]>(() =>
      httpClient.get(`${CHECKS_PATH}/${checkId}/metrics/${metricId}/history`, {
        params: {
          applicationId: query.applicationId,
          from: query.from,
          to: query.to,
          take: query.take,
        },
      }),
    );
  },

  getMetricAggregate(checkId: number, metricId: number, query: MetricAggregateQuery) {
    return requestApiData<MetricAggregateDto>(() =>
      httpClient.get(`${CHECKS_PATH}/${checkId}/metrics/${metricId}/aggregate`, {
        params: {
          aggregation: query.aggregation,
          applicationId: query.applicationId,
          from: query.from,
          to: query.to,
        },
      }),
    );
  },

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
