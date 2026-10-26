export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function buildComponentCode(name: string, existingCodes: string[] = []): string {
  const base =
    name
      .trim()
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .toUpperCase()
      .slice(0, 40) || 'COMP';

  const used = new Set(existingCodes.map((code) => code.toLowerCase()));
  if (!used.has(base.toLowerCase())) {
    return base;
  }

  let suffix = 2;
  while (used.has(`${base}_${suffix}`.toLowerCase())) {
    suffix += 1;
  }

  return `${base}_${suffix}`;
}
