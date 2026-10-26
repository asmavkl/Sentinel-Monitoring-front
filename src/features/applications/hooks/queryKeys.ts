export const applicationQueryKeys = {
  all: ['applications'] as const,
  list: () => [...applicationQueryKeys.all, 'list'] as const,
};
