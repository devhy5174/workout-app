import { useState } from "react";
import { useUser } from "../../context/UserContext";

const WORKOUT_TYPE_LABEL: Record<string, { label: string; emoji: string }> = {
  walker: { label: "걷기", emoji: "🚶" },
  power_walker: { label: "파워워킹", emoji: "🚶‍♂️" },
  runner: { label: "달리기", emoji: "🏃" },
  hiker: { label: "등산", emoji: "🏔️" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${month}/${day} (${days[d.getDay()]})`;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

export default function WorkoutHistoryTab() {
  const { workoutRecords, refreshWorkoutHistory, deleteWorkout } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    await refreshWorkoutHistory();
    setIsRefreshing(false);
  }

  async function handleDelete(id: string) {
    setIsDeleting(true);
    await deleteWorkout(id);
    setIsDeleting(false);
    setDeletingId(null);
  }

  const totalKcal = workoutRecords.reduce((s, r) => s + r.calories, 0);
  const totalSteps = workoutRecords.reduce((s, r) => s + (r.steps ?? 0), 0);

  if (workoutRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 pt-16 pb-20">
        <span className="text-6xl">🏃</span>
        <p className="font-extrabold text-gray-700 text-lg">
          운동 기록이 없어요
        </p>
        <p className="text-sm text-gray-400 text-center">
          운동을 완료하면 여기에 기록이 쌓여요!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-20 h-full overflow-y-auto">
      {/* 요약 카드 */}
      <div
        className="rounded-2xl px-5 py-4 grid grid-cols-3 gap-2"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
        }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-white/70 text-[10px] font-semibold">
            총 운동
          </span>
          <span className="text-white font-extrabold text-lg">
            {workoutRecords.length}회
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-white/70 text-[10px] font-semibold">
            소모 칼로리
          </span>
          <span className="text-white font-extrabold text-lg">
            {totalKcal.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-white/70 text-[10px] font-semibold">
            총 걸음수
          </span>
          <span className="text-white font-extrabold text-lg">
            {totalSteps.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="text-xs font-bold text-[var(--color-primary)] text-right disabled:opacity-50"
      >
        {isRefreshing ? "불러오는 중..." : "↻ 새로고침"}
      </button>

      <div className="flex flex-col gap-3">
        {workoutRecords.map((record) => {
          const typeInfo = WORKOUT_TYPE_LABEL[record.workout_type] ?? {
            label: record.workout_type,
            emoji: "🏃",
          };
          const id = record.id ?? record.created_at ?? "";
          const isPendingDelete = deletingId === id;
          return (
            <div
              key={id}
              className="bg-white rounded-3xl shadow-sm p-4 flex items-center gap-4"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary)22, var(--color-secondary)22)",
                }}
              >
                {typeInfo.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-extrabold text-gray-800 text-sm">
                      {typeInfo.label}
                    </p>
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(id)}
                        disabled={isDeleting}
                        className="text-[10px] font-bold text-red-500 disabled:opacity-50 px-2 py-1"
                        aria-label="삭제 확인"
                      >
                        {isDeleting ? "..." : "삭제"}
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-[10px] font-bold text-gray-400 px-2 py-1"
                        aria-label="취소"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(id)}
                      className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors flex-shrink-0"
                      aria-label="기록 삭제"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(record.date)}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[11px] text-gray-500 font-semibold">
                    🕐 {formatDuration(record.duration)}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold">
                    👟 {record.steps.toLocaleString()}보
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold">
                    📍 {record.distance.toFixed(2)}km
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold">
                    🔥 {record.calories}kcal
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
