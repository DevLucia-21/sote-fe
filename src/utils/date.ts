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
