import type { ActivityType } from "../../data/activityTypes";

interface WorkoutGoalTrackerProps {
  burnedKcal: number;
  workoutTargetKcal: number;
  kcalProgress: number;
  kcalRemaining: number;
  selectedActivityType: ActivityType | null;
  onInfoClick: () => void;
}

export default function WorkoutGoalTracker({
  burnedKcal,
  workoutTargetKcal,
  kcalProgress,
  kcalRemaining,
  selectedActivityType,
  onInfoClick,
}: WorkoutGoalTrackerProps) {
  return (
    <div
      className="rounded-2xl px-5 py-5 flex flex-col gap-3"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-white font-bold text-sm">
            오늘의 운동 목표 칼로리
          </span>
          <button
            type="button"
            onClick={onInfoClick}
            className="w-4 h-4 -m-1 rounded-full bg-white/25 flex items-center justify-center text-white text-[11px] font-extrabold"
            aria-label="운동 목표 칼로리 계산 방식 보기"
          >
            i
          </button>
        </div>
        {selectedActivityType && (
          <span className="text-[11px] font-bold text-white/80 bg-white/20 rounded-full px-2.5 py-0.5">
            {selectedActivityType.emoji} {selectedActivityType.name}
          </span>
        )}
      </div>

      <div className="flex items-end gap-1.5">
        <span className="text-white font-extrabold text-4xl">
          {burnedKcal.toLocaleString()}
        </span>
        <span className="text-white/70 font-bold text-lg pb-1">
          / {workoutTargetKcal.toLocaleString()} kcal
        </span>
      </div>

      <div className="flex flex-col gap-1.5 mt-1">
        <div className="w-full h-2.5 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${kcalProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-white/90">
          <span>목표 달성도 {Math.round(kcalProgress)}%</span>
          {kcalRemaining > 0 ? (
            <span>
              목표까지 {kcalRemaining.toLocaleString()} kcal 남았어요! 💪
            </span>
          ) : (
            <span>🎉 오늘의 운동 목표 달성 완료!</span>
          )}
        </div>
      </div>
    </div>
  );
}
