import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { localDateStr } from "../../utils/streak";

const WORKOUT_TYPE_LABEL: Record<string, { label: string; emoji: string }> = {
  walker: { label: "걷기", emoji: "🚶" },
  power_walker: { label: "파워워킹", emoji: "🚶‍♂️" },
  runner: { label: "달리기", emoji: "🏃" },
  hiker: { label: "등산", emoji: "🏔️" },
};

type Period = "week" | "month" | "all";

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

function getDateLabel(dateStr: string): string {
  const today = localDateStr(new Date());
  const yesterday = localDateStr(new Date(Date.now() - 86400000));
  if (dateStr === today) return "오늘";
  if (dateStr === yesterday) return "어제";
  const d = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
}

export default function WorkoutHistoryTab() {
  const { workoutRecords, deleteWorkout } = useUser();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("month");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(id: string) {
    setIsDeleting(true);
    await deleteWorkout(id);
    setIsDeleting(false);
    setDeletingId(null);
  }

  const now = new Date();
  const todayStr = localDateStr(now);

  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const weekStart = localDateStr(monday);

  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const filteredRecords = useMemo(() => {
    if (period === "week") return workoutRecords.filter((r) => r.date >= weekStart);
    if (period === "month") return workoutRecords.filter((r) => r.date >= monthStart);
    return workoutRecords;
  }, [workoutRecords, period, weekStart, monthStart]);

  const summary = useMemo(() => ({
    count: filteredRecords.length,
    steps: filteredRecords.reduce((s, r) => s + (r.steps ?? 0), 0),
    calories: filteredRecords.reduce((s, r) => s + (r.calories ?? 0), 0),
    distance: filteredRecords.reduce((s, r) => s + (r.distance ?? 0), 0),
  }), [filteredRecords]);

  // 날짜별 그루핑
  const grouped = useMemo(() => {
    const map = new Map<string, typeof workoutRecords>();
    for (const r of filteredRecords) {
      const key = r.date ?? todayStr;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [filteredRecords, todayStr]);

  const PERIOD_TABS: { key: Period; label: string }[] = [
    { key: "week", label: "이번 주" },
    { key: "month", label: "이번 달" },
    { key: "all", label: "전체" },
  ];

  if (workoutRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 pt-16 pb-20">
        <span className="text-6xl">🏃</span>
        <p className="font-extrabold text-gray-700 text-lg">운동 기록이 없어요</p>
        <p className="text-sm text-gray-400 text-center">운동을 완료하면 여기에 기록이 쌓여요!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-20 h-full overflow-y-auto">

      {/* 기간 탭 */}
      <div className="bg-gray-100 rounded-2xl p-1 flex">
        {PERIOD_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              period === key ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 요약 카드 */}
      <div
        className="rounded-3xl p-5 grid grid-cols-2 gap-3"
        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
      >
        {[
          { label: "운동 횟수", value: `${summary.count}회` },
          { label: "총 걸음수", value: `${summary.steps.toLocaleString()}보` },
          { label: "소모 칼로리", value: `${Math.round(summary.calories).toLocaleString()}kcal` },
          { label: "총 거리", value: `${summary.distance.toFixed(1)}km` },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-white/60 text-[11px] font-semibold">{label}</span>
            <span className="text-white font-extrabold text-lg leading-tight">{value}</span>
          </div>
        ))}
      </div>

      {/* 기록 없음 (필터 결과) */}
      {grouped.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-300">
          <span className="text-4xl">🏃</span>
          <p className="text-sm font-bold">이 기간에 운동 기록이 없어요</p>
        </div>
      )}

      {/* 상세 페이지 안내 */}
      {grouped.length > 0 && (
        <p className="text-center text-xs text-gray-400 font-semibold">
          운동 기록을 눌러 거리와 페이스를 확인해보세요 👀
        </p>
      )}

      {/* 날짜별 그루핑 */}
      {grouped.map(([date, records]) => (
        <div key={date}>
          {/* 날짜 헤더 */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-xs font-extrabold text-gray-500">{getDateLabel(date)}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="flex flex-col gap-2">
            {records.map((record) => {
              const typeInfo = WORKOUT_TYPE_LABEL[record.workout_type] ?? { label: record.workout_type, emoji: "🏃" };
              const id = record.id ?? record.created_at ?? "";
              const isPendingDelete = deletingId === id;

              return (
                <div
                  key={id}
                  className="bg-white rounded-3xl shadow-sm p-4 flex items-center gap-4 active:opacity-75 transition-opacity"
                  onClick={() => record.id && navigate(`/workout/${record.id}`)}
                  role={record.id ? "button" : undefined}
                  style={{ cursor: record.id ? "pointer" : "default" }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                    style={{ background: "linear-gradient(135deg, var(--color-primary)22, var(--color-secondary)22)" }}
                  >
                    {typeInfo.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-extrabold text-gray-800 text-sm">{typeInfo.label}</p>
                        {record.goal_achieved && (
                          <span
                            className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                            style={{ background: "var(--color-primary)" }}
                          >
                            🏆 달성
                          </span>
                        )}
                      </div>
                      {isPendingDelete ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(id)}
                            disabled={isDeleting}
                            className="text-[10px] font-bold text-red-500 disabled:opacity-50 px-2 py-1"
                          >
                            {isDeleting ? "..." : "삭제"}
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="text-[10px] font-bold text-gray-400 px-2 py-1"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingId(id); }}
                          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 active:bg-red-50 active:text-red-400 transition-colors flex-shrink-0"
                          aria-label="기록 삭제"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* 스탯 행 */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-[11px] text-gray-500 font-semibold">⏱ {formatDuration(record.duration)}</span>
                      <span className="text-[11px] text-gray-500 font-semibold">👣 {record.steps.toLocaleString()}보</span>
                      <span className="text-[11px] text-gray-500 font-semibold">📍 {record.distance.toFixed(2)}km</span>
                      <span className="text-[11px] text-gray-500 font-semibold">🔥 {record.calories}kcal</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
