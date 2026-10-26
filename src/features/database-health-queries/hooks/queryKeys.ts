import type { DatabaseHealthQueryListFilters } from '@/types/databaseHealthQueries';

export const databaseHealthQueryKeys = {
  all: ['database-health-queries'] as const,
  lists: () => [...databaseHealthQueryKeys.all, 'list'] as const,
  list: (filters: DatabaseHealthQueryListFilters = {}) =>
    [
      ...databaseHealthQueryKeys.lists(),
      filters.databaseType ?? null,
      filters.category ?? null,
      filters.isActive ?? null,
      filters.search?.trim() ?? '',
    ] as const,
  detail: (id: number) => [...databaseHealthQueryKeys.all, 'detail', id] as const,
};
