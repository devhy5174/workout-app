import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useUser } from "../../context/UserContext";
import type { WorkoutRecord } from "../../lib/workoutService";

// distance_source: "estimated" (steps × stride) | "gps" (추후 교체 지점)
// GPS 연동 시 이 함수만 교체하면 전체 탭에 반영됨
function getDistance(r: WorkoutRecord): number {
  return r.distance ?? 0; // 현재는 저장 시 steps 기반 추정값
}

function formatPace(durationSec: number, distanceKm: number): string {
  if (distanceKm < 0.01) return "--'--\"";
  const minPerKm = durationSec / 60 / distanceKm;
  const m = Math.floor(minPerKm);
  let s = Math.round((minPerKm - m) * 60);
  const carry = s === 60 ? 1 : 0;
  s = s === 60 ? 0 : s;
  return `${m + carry}'${String(s).padStart(2, "0")}"`;
}

function formatDist(km: number): string {
  return `${km.toFixed(2)}km`;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}시간 ${m % 60}분`;
  return `${m}분`;
}

type Period = "month" | "3month" | "all";

const PERIOD_TABS: { key: Period; label: string }[] = [
  { key: "month", label: "1개월" },
  { key: "3month", label: "3개월" },
  { key: "all", label: "전체" },
];

export default function RunnerStatsTab() {
  const { workoutRecords } = useUser();
  const [period, setPeriod] = useState<Period>("month");

  // 러너 기록만, 날짜 오름차순
  const allRuns = useMemo(
    () =>
      workoutRecords
        .filter((r) => r.workout_type === "runner")
        .sort((a, b) => a.date.localeCompare(b.date)),
    [workoutRecords],
  );

  // 기간 필터
  const filteredRuns = useMemo(() => {
    if (period === "all") return allRuns;
    const months = period === "month" ? 1 : 3;
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
    const cutoffStr = [
      cutoff.getFullYear(),
      String(cutoff.getMonth() + 1).padStart(2, "0"),
      String(cutoff.getDate()).padStart(2, "0"),
    ].join("-");
    return allRuns.filter((r) => r.date >= cutoffStr);
  }, [allRuns, period]);

  // 전체 기간 요약 통계
  const summary = useMemo(() => {
    if (allRuns.length === 0) return null;
    const totalDist = allRuns.reduce((s, r) => s + getDistance(r), 0);
    const totalDur = allRuns.reduce((s, r) => s + r.duration, 0);
    const totalCal = allRuns.reduce((s, r) => s + r.calories, 0);

    const bestDistRun = allRuns.reduce((best, r) =>
      getDistance(r) > getDistance(best) ? r : best,
    );

    const validRuns = allRuns.filter((r) => getDistance(r) > 0.1);
    const bestPaceRun =
      validRuns.length > 0
        ? validRuns.reduce((best, r) => {
            const p = r.duration / getDistance(r);
            const bp = best.duration / getDistance(best);
            return p < bp ? r : best;
          })
        : null;

    return {
      count: allRuns.length,
      totalDist,
      totalCal,
      avgPace: totalDist > 0 ? formatPace(totalDur, totalDist) : "--'--\"",
      bestDist: getDistance(bestDistRun),
      bestPace: bestPaceRun
        ? formatPace(bestPaceRun.duration, getDistance(bestPaceRun))
        : "--'--\"",
    };
  }, [allRuns]);

  // 차트 데이터 (필터 기간 기준 — 각 러닝을 1개 바로)
  const chartData = useMemo(
    () =>
      filteredRuns.map((r) => ({
        label: r.date.slice(5).replace("-", "/"),
        distance: parseFloat(getDistance(r).toFixed(2)),
        paceStr: formatPace(r.duration, getDistance(r)),
      })),
    [filteredRuns],
  );

  const xInterval =
    chartData.length > 14
      ? Math.floor(chartData.length / 7)
      : chartData.length > 8
        ? 1
        : 0;

  if (allRuns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <span className="text-6xl">🏃</span>
        <p className="font-extrabold text-gray-700 text-lg">러닝 기록이 없어요</p>
        <p className="text-sm text-gray-400 text-center leading-relaxed">
          러너 유형으로 운동을 완료하면
          <br />
          여기에 분석이 쌓여요!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 전체 기간 요약 */}
      <div
        className="rounded-3xl p-5"
        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
      >
        <p className="text-white/70 text-[11px] font-bold mb-3 tracking-wide">
          🏃 러닝 전체 기록
        </p>
        <div className="grid grid-cols-3 gap-y-4 gap-x-2">
          {[
            { label: "총 러닝", value: `${summary!.count}회` },
            { label: "총 거리", value: formatDist(summary!.totalDist) },
            { label: "소모 칼로리", value: `${summary!.totalCal.toLocaleString()}kcal` },
            { label: "평균 페이스", value: `${summary!.avgPace}/km` },
            { label: "최고 거리", value: formatDist(summary!.bestDist) },
            { label: "최고 페이스", value: `${summary!.bestPace}/km` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-white/60 text-[10px] font-semibold">{label}</span>
              <span className="text-white font-extrabold text-sm leading-tight">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 거리 차트 */}
      <div className="bg-white rounded-3xl shadow-sm">
        <div
          className="px-5 py-4 rounded-t-3xl"
          style={{ background: "linear-gradient(135deg, var(--color-primary)18, var(--color-secondary)18)" }}
        >
          <p className="font-extrabold text-gray-800">러닝 거리 차트</p>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="bg-gray-100 rounded-2xl p-1 flex">
            {PERIOD_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  period === key
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-300">
              <span className="text-3xl">🏃</span>
              <p className="text-sm font-bold">이 기간엔 러닝 기록이 없어요</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  interval={xInterval}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}km`}
                />
                <Tooltip
                  formatter={(value, _name, props) => [
                    `${value}km  ⚡ ${(props.payload as { paceStr?: string })?.paceStr ?? ""}/km`,
                    "거리 · 페이스",
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    fontSize: 12,
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar
                  dataKey="distance"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 최근 러닝 목록 */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div
          className="px-5 py-4"
          style={{ background: "linear-gradient(135deg, var(--color-primary)18, var(--color-secondary)18)" }}
        >
          <p className="font-extrabold text-gray-800">최근 러닝</p>
        </div>
        <div className="flex flex-col divide-y divide-gray-50">
          {[...allRuns]
            .reverse()
            .slice(0, 8)
            .map((r, i) => {
              const dist = getDistance(r);
              const pace = formatPace(r.duration, dist);
              return (
                <div key={r.id ?? i} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: "var(--color-primary-light)" }}>
                    🏃
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 font-semibold">{r.date}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-sm font-extrabold text-gray-800">
                        {dist.toFixed(2)}km
                      </span>
                      <span className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>
                        ⚡ {pace}/km
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">
                        ⏱ {formatDuration(r.duration)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-semibold flex-shrink-0">
                    🔥 {r.calories}kcal
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* GPS 미연동 안내 */}
      <div className="rounded-2xl p-4 border border-dashed border-gray-200 flex items-start gap-3">
        <span className="text-base">📍</span>
        <div>
          <p className="text-xs font-bold text-gray-500">현재 GPS 미연동</p>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
            거리와 페이스는 걸음수 기반 추정값이에요.
            <br />
            GPS 연동 시 더 정확한 페이스 분석이 가능해요.
          </p>
        </div>
      </div>
    </>
  );
}
