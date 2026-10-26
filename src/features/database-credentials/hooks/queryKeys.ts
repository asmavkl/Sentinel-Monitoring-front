export const databaseCredentialsQueryKeys = {
  all: ['database-credentials'] as const,
  list: () => [...databaseCredentialsQueryKeys.all, 'list'] as const,
  detail: (id: number) => [...databaseCredentialsQueryKeys.all, 'detail', id] as const,
};
