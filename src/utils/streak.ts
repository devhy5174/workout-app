// toISOString()은 UTC 기준이라 UTC+9에서 하루 밀릴 수 있음 — 로컬 날짜 사용
export function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function getBonusPoints(date: Date): number {
  return isWeekend(date) ? 5 : 0;
}

// 실제 달력 기준 연속 스트릭 (토일 포함, 30일 챌린지용)
export function calcConsecutiveStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates);
  const today = localDateStr(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = localDateStr(yesterday);

  // 오늘 기록 있으면 오늘부터, 없으면 어제부터 (오늘 아직 안 걸을 수 있음)
  const startStr = set.has(today) ? today : set.has(yesterdayStr) ? yesterdayStr : null;
  if (!startStr) return 0;

  let count = 0;
  const d = new Date(startStr);
  while (set.has(localDateStr(d))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

// 이벤트 시작일 기준 연속 스트릭 — sinceDate 이전 기록은 무시
export function calcStreakSince(dates: string[], sinceDate: string): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates.filter((d) => d >= sinceDate));
  const today = localDateStr(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = localDateStr(yesterday);

  const startStr = set.has(today) ? today : set.has(yesterdayStr) ? yesterdayStr : null;
  if (!startStr || startStr < sinceDate) return 0;

  let count = 0;
  const d = new Date(startStr);
  while (set.has(localDateStr(d)) && localDateStr(d) >= sinceDate) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

// 월~금 기준 연속 스트릭. 토일은 패스(끊기지 않음).
export function calculateStreak(history: string[]): number {
  const set = new Set(history);
  let count = 0;
  const d = new Date();

  while (true) {
    if (isWeekend(d)) {
      d.setDate(d.getDate() - 1);
      continue;
    }
    if (set.has(localDateStr(d))) {
      count++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return count;
}

// 이번주 월~일 7개 boolean 배열 반환 (토일 운동도 포함)
export function getThisWeekWorkouts(history: string[]): boolean[] {
  const set = new Set(history);
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return set.has(localDateStr(d));
  });
}
