const REWRITTEN_DIARY_STATUS_PREFIX = 'rewritten-diary-status';

export function normalizeDiaryDateKey(rawDate?: string | null) {
  if (!rawDate) return '';
  return rawDate.split('T')[0];
}

function getRewrittenDiaryStatusKey(date: string) {
  return `${REWRITTEN_DIARY_STATUS_PREFIX}:${normalizeDiaryDateKey(date)}`;
}

export function markDiaryAsRewritten(date?: string | null) {
  const normalizedDate = normalizeDiaryDateKey(date);
  if (!normalizedDate) return;

  localStorage.setItem(getRewrittenDiaryStatusKey(normalizedDate), 'true');
}

export function hasRewrittenDiaryStatus(date?: string | null) {
  const normalizedDate = normalizeDiaryDateKey(date);
  if (!normalizedDate) return false;

  return localStorage.getItem(getRewrittenDiaryStatusKey(normalizedDate)) === 'true';
}

export function clearRewrittenDiaryStatus(date?: string | null) {
  const normalizedDate = normalizeDiaryDateKey(date);
  if (!normalizedDate) return;

  localStorage.removeItem(getRewrittenDiaryStatusKey(normalizedDate));
}
