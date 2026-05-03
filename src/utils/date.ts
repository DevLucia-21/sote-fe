// 날짜 포맷 유틸리티

/**
 * Date 객체를 "YYYY-MM-DD" 문자열로 변환
 */
export function formatDateToAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * "YYYY-MM-DD" 문자열을 Date 객체로 변환
 */
export function parseAPIDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * 현재 날짜를 "YYYY-MM-DD" 형식으로 반환
 */
export function getTodayString(): string {
  return formatDateToAPI(new Date());
}

/**
 * 두 날짜가 같은 날인지 확인
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateToAPI(date1) === formatDateToAPI(date2);
}

/**
 * 오늘 날짜인지 확인
 */
export function isToday(date: Date | string): boolean {
  const dateStr = typeof date === 'string' ? date : formatDateToAPI(date);
  return dateStr === getTodayString();
}

/**
 * 과거 날짜인지 확인
 */
export function isPastDate(date: Date | string): boolean {
  const dateStr = typeof date === 'string' ? date : formatDateToAPI(date);
  return dateStr < getTodayString();
}

/**
 * "YYYY-MM" 형식으로 변환 (월별 API용)
 */
export function formatYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getStartOfWeek(date: Date): Date {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  local.setDate(local.getDate() - local.getDay());
  return local;
}

export function getWeekOfMonth(date: Date): number {
  const startOfWeek = getStartOfWeek(date);
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstWeekStart = getStartOfWeek(firstDayOfMonth);
  const diffDays = Math.floor(
    (startOfWeek.getTime() - firstWeekStart.getTime()) / 86400000,
  );

  return Math.floor(diffDays / 7) + 1;
}

export function getMonthWeekDate(year: number, month: number, week: number): Date {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const firstWeekStart = getStartOfWeek(monthStart);
  const weekStart = new Date(firstWeekStart);
  weekStart.setDate(firstWeekStart.getDate() + (week - 1) * 7);

  if (weekStart < monthStart) return monthStart;
  if (weekStart > monthEnd) return monthEnd;
  return weekStart;
}

export function getWeekDateList(date: Date): string[] {
  const start = getStartOfWeek(date);

  return Array.from({ length: 7 }, (_, index) => {
    const item = new Date(start);
    item.setDate(start.getDate() + index);
    return formatDateToAPI(item);
  });
}

export function getWeekSelection(date: Date) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const weekStart = getStartOfWeek(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const clippedStart = weekStart < monthStart ? monthStart : weekStart;
  const clippedEnd = weekEnd > monthEnd ? monthEnd : weekEnd;

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    week: getWeekOfMonth(date),
    start: formatDateToAPI(clippedStart),
    end: formatDateToAPI(clippedEnd),
  };
}
