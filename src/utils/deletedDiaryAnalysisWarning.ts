const DELETED_DIARY_ANALYSIS_WARNING_PREFIX = 'deleted-diary-analysis-warning';

export function normalizeDiaryDateKey(rawDate?: string | null) {
  if (!rawDate) return '';
  return rawDate.split('T')[0];
}

function getDeletedDiaryAnalysisWarningKey(date: string) {
  return `${DELETED_DIARY_ANALYSIS_WARNING_PREFIX}:${normalizeDiaryDateKey(date)}`;
}

export function markDeletedDiaryAnalysisWarning(date?: string | null) {
  const normalizedDate = normalizeDiaryDateKey(date);
  if (!normalizedDate) return;

  localStorage.setItem(getDeletedDiaryAnalysisWarningKey(normalizedDate), 'true');
}

export function hasDeletedDiaryAnalysisWarning(date?: string | null) {
  const normalizedDate = normalizeDiaryDateKey(date);
  if (!normalizedDate) return false;

  return localStorage.getItem(getDeletedDiaryAnalysisWarningKey(normalizedDate)) === 'true';
}

export function clearDeletedDiaryAnalysisWarning(date?: string | null) {
  const normalizedDate = normalizeDiaryDateKey(date);
  if (!normalizedDate) return;

  localStorage.removeItem(getDeletedDiaryAnalysisWarningKey(normalizedDate));
}
