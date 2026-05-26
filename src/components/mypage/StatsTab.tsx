import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { usePremium } from "../../context/PremiumContext";
import { useWorkoutStats } from "../../hooks/useWorkoutStats";
import { localDateStr } from "../../utils/streak";
import { getPremiumTabPath } from "../../utils/premiumNavigation";
import WorkoutCalendar from "../ui/WorkoutCalendar";
import PremiumReportSection from "./PremiumReportSection";
import RunnerStatsTab from "./RunnerStatsTab";

type SubTab = "general" | "runner";

export default function StatsTab() {
  const { user, workoutRecords } = useUser();
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const [subTab, setSubTab] = useState<SubTab>("general");
  const { period, setPeriod, data, isLoading, periodLabel, totalSteps } =
    useWorkoutStats(user?.id ?? null, workoutRecords);

  const weeklyReport = useMemo(() => {
    const now = new Date();
    const dow = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() + (dow === 0 ? -6 : 1 - dow));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const lastMonday = new Date(monday);
    lastMonday.setDate(monday.getDate() - 7);
    const lastSunday = new Date(monday);
    lastSunday.setDate(monday.getDate() - 1);

    const mondayStr = localDateStr(monday);
    const sundayStr = localDateStr(sunday);
    const lastMondayStr = localDateStr(lastMonday);
    const lastSundayStr = localDateStr(lastSunday);

    const thisWeekRecords = workoutRecords.filter(
      (r) => r.date >= mondayStr && r.date <= sundayStr,
    );
    const thisWeekSteps = thisWeekRecords.reduce(
      (s, r) => s + (r.steps ?? 0),
      0,
    );
    if (thisWeekSteps === 0) return null;

    const lastWeekSteps = workoutRecords
      .filter((r) => r.date >= lastMondayStr && r.date <= lastSundayStr)
      .reduce((s, r) => s + (r.steps ?? 0), 0);

    const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
    const byDay: Record<string, number> = {};
    thisWeekRecords.forEach((r) => {
      const label = DAY_LABELS[new Date(r.date).getDay()];
      byDay[label] = (byDay[label] ?? 0) + (r.steps ?? 0);
    });
    const bestDay = Object.entries(byDay).reduce(
      (best, [day, steps]) => (steps > best.steps ? { day, steps } : best),
      { day: "—", steps: 0 },
    ).day;

    const change =
      lastWeekSteps > 0
        ? Math.round(((thisWeekSteps - lastWeekSteps) / lastWeekSteps) * 100)
        : null;

    return {
      avgSteps: Math.round(thisWeekSteps / 7),
      workoutCount: thisWeekRecords.length,
      bestDay,
      change,
    };
  }, [workoutRecords]);

  const periods = [
    { key: "day" as const, label: "1일" },
    { key: "week" as const, label: "1주" },
    { key: "month" as const, label: "1개월" },
  ];

  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const displaySteps =
    period === "day"
      ? totalSteps
      : period === "week"
        ? Math.round(totalSteps / 7)
        : Math.round(totalSteps / daysInMonth);
  const displayLabel = period === "day" ? "오늘 총 걸음수" : "일 평균 걸음수";
  const chartTitle =
    period === "day"
      ? "시간대별 걸음수"
      : period === "week"
        ? "요일별 걸음수"
        : "일별 걸음수";
  const xInterval = period === "day" ? 2 : period === "month" ? 4 : 0;
  const maxBarSize = period === "month" ? 10 : 36;

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-20 h-full overflow-y-auto">
      {/* [ 일반 ] [ 활동 분석 ] 서브탭 */}
      <div className="bg-gray-100 rounded-2xl p-1 flex">
        <button
          onClick={() => setSubTab("general")}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
            subTab === "general"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-400"
          }`}
        >
          일반
        </button>
        <button
          onClick={() => setSubTab("runner")}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
            subTab === "runner"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-400"
          }`}
        >
          활동 분석
        </button>
      </div>

      {/* 활동 분석 탭 */}
      {subTab === "runner" && <RunnerStatsTab />}

      {/* 일반 탭 */}
      {subTab === "general" && (
        <>
          {/* 주간 리포트 */}
          {weeklyReport && (
            <div className="bg-white rounded-3xl shadow-sm">
              <div
                className="px-5 py-4 flex items-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary)18, var(--color-secondary)18)",
                }}
              >
                <p className="font-extrabold text-gray-800">이번주 리포트</p>
              </div>
              <div className="flex flex-col gap-2 p-4">
                {[
                  {
                    label: "평균 걸음수",
                    value: `${weeklyReport.avgSteps.toLocaleString()}보`,
                    colored: true,
                  },
                  {
                    label: "총 운동",
                    value: `${weeklyReport.workoutCount}회`,
                    colored: true,
                  },
                  {
                    label: "가장 많이 걸은 날",
                    value:
                      weeklyReport.bestDay === "—"
                        ? "—"
                        : `${weeklyReport.bestDay}요일`,
                    colored: false,
                  },
                ].map(({ label, value, colored }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3"
                  >
                    <span className="text-sm text-gray-500 font-semibold">
                      {label}
                    </span>
                    <span
                      className={`text-sm font-extrabold ${colored ? "" : "text-gray-800"}`}
                      style={colored ? { color: "var(--color-primary)" } : {}}
                    >
                      {value}
                    </span>
                  </div>
                ))}
                {weeklyReport.change !== null && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                    <span className="text-sm text-gray-500 font-semibold">
                      지난주 대비
                    </span>
                    <span
                      className={`text-sm font-extrabold ${weeklyReport.change >= 0 ? "text-emerald-500" : "text-red-400"}`}
                    >
                      {weeklyReport.change >= 0 ? "+" : ""}
                      {weeklyReport.change}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 활동 차트 카드 */}
          <div className="bg-white rounded-3xl shadow-sm">
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary)18, var(--color-secondary)18)",
              }}
            >
              <p className="font-extrabold text-gray-800">활동 차트</p>
            </div>

            <div className="flex flex-col gap-4 p-4">
              {/* 기간 탭 */}
              <div className="bg-gray-100 rounded-2xl p-1 flex">
                {periods.map(({ key, label }) => (
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

              <p className="text-xs text-center text-gray-400 font-semibold -mt-1">
                {periodLabel}
              </p>

              {/* 수치 */}
              <div className="flex flex-col items-center gap-1 py-2">
                <p className="text-xs text-gray-400 font-semibold">
                  {displayLabel}
                </p>
                {isLoading ? (
                  <p className="text-5xl font-extrabold text-gray-200 animate-pulse">
                    —
                  </p>
                ) : (
                  <p
                    className="text-5xl font-extrabold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {displaySteps.toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-gray-400 font-semibold">보</p>
              </div>

              <div className="h-px bg-gray-100" />

              {/* 막대 그래프 */}
              <div>
                <p className="text-xs font-bold text-gray-400 mb-3">
                  {chartTitle}
                </p>
                {isLoading ? (
                  <div className="flex items-center justify-center h-44">
                    <p className="font-bold text-sm text-gray-300 animate-pulse">
                      불러오는 중...
                    </p>
                  </div>
                ) : totalSteps === 0 ? (
                  <div className="flex flex-col items-center justify-center h-44 gap-2 text-gray-300">
                    <span className="text-4xl">🏃</span>
                    <p className="text-sm font-bold">
                      이 기간에 운동 기록이 없어요
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={data}
                      margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        stroke="#f3f4f6"
                      />
                      <XAxis
                        dataKey="label"
                        tick={{
                          fontSize: 10,
                          fill: "#9ca3af",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                        interval={xInterval}
                      />
                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: "#9ca3af",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) =>
                          v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${Number(value ?? 0).toLocaleString()}보`,
                          "걸음수",
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
                        dataKey="steps"
                        fill="var(--color-primary)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={maxBarSize}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* 운동 달력 */}
          <WorkoutCalendar workoutRecords={workoutRecords} />

          {/* 프리미엄 월간 리포트 */}
          <div id="mbti-report">
            <PremiumReportSection
              isPremium={isPremium}
              onUpgrade={() => navigate(getPremiumTabPath())}
              workouts={workoutRecords}
            />
          </div>
        </>
      )}
    </div>
  );
}
