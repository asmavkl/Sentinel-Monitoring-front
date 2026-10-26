import type { DatasetColumnDto, DatasetDto } from '@/types/dashboard';

export function detectDateTimeColumn(columns: DatasetColumnDto[]): string | null {
  const datetimeColumn = columns.find((col) =>
    col.type.toLowerCase().includes('datetime') ||
    col.type.toLowerCase().includes('timestamp') ||
    col.type.toLowerCase().includes('date'),
  );
  return datetimeColumn?.name ?? null;
}

export function detectNumericColumns(columns: DatasetColumnDto[]): string[] {
  return columns
    .filter((col) =>
      col.type.toLowerCase().includes('number') ||
      col.type.toLowerCase().includes('int') ||
      col.type.toLowerCase().includes('decimal') ||
      col.type.toLowerCase().includes('float'),
    )
    .map((col) => col.name);
}

export function detectDefaultDatasetConfiguration(dataset: DatasetDto): {
  timeColumn: string | null;
  valueColumns: string[];
} {
  const timeColumn = detectDateTimeColumn(dataset.columns);
  const valueColumns = detectNumericColumns(dataset.columns);
  return { timeColumn, valueColumns };
}

export function isDatasetEmpty(dataset: DatasetDto | null): boolean {
  if (!dataset) return true;
  return dataset.rows.length === 0;
}
