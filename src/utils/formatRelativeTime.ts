export function formatRelativeTime(value?: string | number | Date | null): string {
  if (value == null || value === 0) {
    return '—';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  // Ensure the date is treated as UTC
  // If the timestamp doesn't have 'Z', add it to force UTC parsing
  const dateStr = value instanceof Date ? value.toISOString() : String(value);
  const utcDate = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');

  // Both Date.now() and utcDate.getTime() return UTC timestamps
  const diffMs = Date.now() - utcDate.getTime();
  if (diffMs < 0) {
    return 'همین الان';
  }

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) {
    return `${seconds.toLocaleString('fa-IR')} ثانیه پیش`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes.toLocaleString('fa-IR')} دقیقه پیش`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours.toLocaleString('fa-IR')} ساعت پیش`;
  }

  const days = Math.floor(hours / 24);
  return `${days.toLocaleString('fa-IR')} روز پیش`;
}
