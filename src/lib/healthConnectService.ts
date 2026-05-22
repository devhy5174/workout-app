import { Health } from "@capgo/capacitor-health";
import { Capacitor } from "@capacitor/core";

export type HCState = "available" | "unavailable" | "denied";

let _state: HCState = "unavailable";

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { startDate: start.toISOString(), endDate: now.toISOString() };
}

/**
 * Health Connect 가용성 확인 + READ_STEPS 권한 요청.
 * - 웹/비네이티브 환경이면 즉시 "unavailable" 반환
 * - Health Connect 미설치 / Android 9 미만이면 "unavailable"
 * - 권한 거부 시 "denied"
 * - 예외 발생 시 "unavailable" → 항상 안전하게 반환
 */
export async function initHealthConnect(): Promise<HCState> {
  if (!Capacitor.isNativePlatform()) return (_state = "unavailable");
  try {
    const availability = await Health.isAvailable();
    if (!availability?.available) return (_state = "unavailable");

    const status = await Health.requestAuthorization({ read: ["steps"] });
    // readAuthorized가 배열이 아닌 경우에도 안전하게 처리
    const granted = Array.isArray(status?.readAuthorized)
      ? status.readAuthorized.includes("steps")
      : false;
    return (_state = granted ? "available" : "denied");
  } catch (e) {
    console.warn("[HealthConnect] initHealthConnect 오류:", e);
    return (_state = "unavailable");
  }
}

/**
 * 오늘 자정부터 지금까지의 누적 걸음수를 Health Connect readSamples로 읽어 합산.
 * - queryAggregated 대신 readSamples 사용: 개별 구간 레코드를 직접 합산하여 안정성 향상
 * - 오류 또는 권한 없으면 null 반환 → 호출자가 fallback 처리
 */
export async function readTodayStepsHC(): Promise<number | null> {
  if (_state !== "available") return null;
  try {
    const { startDate, endDate } = todayRange();
    const { samples } = await Health.readSamples({
      dataType: "steps",
      startDate,
      endDate,
      limit: 1000,
      ascending: true,
    });
    if (!Array.isArray(samples)) return 0;
    return samples.reduce((sum, s) => sum + (Number(s?.value) || 0), 0);
  } catch (e) {
    console.warn("[HealthConnect] readTodayStepsHC 오류:", e);
    return null;
  }
}

export function getHCState(): HCState {
  return _state;
}

/** 명시적 상태 초기화 (운동 리셋 시 호출) */
export function resetHCState(): void {
  _state = "unavailable";
}
