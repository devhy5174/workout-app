import { useState } from "react";
import { useUser } from "../context/UserContext";
import { type UserGoal } from "../lib/workoutService";
import { POINT_RULES } from "../data/points";

const MILESTONE_KM = 100;

const GOAL_OPTIONS: {
  type: UserGoal["goal_type"];
  label: string;
  unit: string;
  placeholder: string;
}[] = [
  { type: "steps", label: "걸음수", unit: "보", placeholder: "예: 8000" },
  { type: "distance", label: "거리", unit: "km", placeholder: "예: 3" },
  { type: "calories", label: "칼로리", unit: "kcal", placeholder: "예: 300" },
];

function GoalModal({ onClose }: { onClose: () => void }) {
  const { userGoal, saveGoal } = useUser();
  const [type, setType] = useState<UserGoal["goal_type"]>(
    userGoal?.goal_type ?? "steps",
  );
  const [value, setValue] = useState(
    userGoal ? String(userGoal.goal_value) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setError("올바른 숫자를 입력해주세요.");
      return;
    }
    setSaving(true);
    const result = await saveGoal(type, num);
    setSaving(false);
    if (result.error) setError(result.error);
    else onClose();
  }

  const opt = GOAL_OPTIONS.find((o) => o.type === type)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-gray-800 text-lg">목표 설정</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {GOAL_OPTIONS.map((o) => (
            <button
              key={o.type}
              onClick={() => {
                setType(o.type);
                setValue("");
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all ${
                type === o.type
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  : "border-gray-100 text-gray-400 bg-gray-50"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 mb-2">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder={opt.placeholder}
            className="flex-1 bg-transparent text-lg font-extrabold text-gray-800 outline-none placeholder:text-gray-300"
          />
          <span className="text-sm font-bold text-gray-400">{opt.unit}</span>
        </div>
        {error && <p className="text-xs text-red-500 mb-2 px-1">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || !value}
          className="w-full py-4 rounded-2xl text-white font-extrabold shadow-md disabled:opacity-50 mt-2"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          }}
        >
          {saving ? "저장 중..." : "목표 저장하기"}
        </button>
      </div>
    </div>
  );
}

export default function Goal() {
  const { userGoal, workoutRecords, userProfile } = useUser();
  const [showModal, setShowModal] = useState(false);

  const totalSteps = workoutRecords.reduce((s, r) => s + r.steps, 0);
  const totalDistance = workoutRecords.reduce((s, r) => s + r.distance, 0);
  const totalCalories = workoutRecords.reduce((s, r) => s + r.calories, 0);

  const goalCurrentValue =
    userGoal?.goal_type === "steps"
      ? totalSteps
      : userGoal?.goal_type === "distance"
        ? totalDistance
        : totalCalories;

  const goalPct = userGoal
    ? Math.min(Math.round((goalCurrentValue / userGoal.goal_value) * 100), 100)
    : 0;

  const milestonePct = Math.min((totalDistance / MILESTONE_KM) * 100, 100);
  const totalPoints = userProfile?.points ?? 0;

  const goalUnit =
    userGoal?.goal_type === "steps"
      ? "보"
      : userGoal?.goal_type === "distance"
        ? "km"
        : "kcal";

  return (
    <div className="flex flex-col gap-4 p-5 h-full overflow-y-auto pb-20">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-extrabold text-gray-800">목표 & 저금</h2>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs font-bold px-3 py-1.5 rounded-full text-white active:scale-95 transition"
          style={{ background: "var(--color-primary)" }}
          aria-label={userGoal ? "목표 변경" : "목표 설정"}
        >
          {userGoal ? "목표 변경" : "목표 설정"}
        </button>
      </div>

      {/* 오늘 목표 카드 */}
      {userGoal ? (
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700">오늘 목표</span>
            <span
              className="font-extrabold text-sm"
              style={{ color: "var(--color-primary)" }}
            >
              {goalPct}% 달성
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-primary to-secondary"
              style={{ width: `${goalPct}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              누적{" "}
              {userGoal.goal_type === "distance"
                ? totalDistance.toFixed(2)
                : Math.round(goalCurrentValue).toLocaleString()}
              {goalUnit}
            </span>
            <span>
              목표 {userGoal.goal_value.toLocaleString()}
              {goalUnit}
            </span>
          </div>
          {goalPct >= 100 && (
            <div
              className="flex items-center justify-center gap-2 py-2 rounded-2xl"
              style={{ background: "var(--color-primary-light)" }}
            >
              <span>🏆</span>
              <span
                className="font-extrabold text-sm"
                style={{ color: "var(--color-primary)" }}
              >
                오늘 목표 달성!
              </span>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="bg-white rounded-3xl shadow-sm p-5 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 active:scale-95 transition min-h-[100px]"
        >
          <span className="text-3xl">🎯</span>
          <p className="font-bold text-gray-400 text-sm">
            목표를 설정해보세요
          </p>
        </button>
      )}

      {/* 누적 거리 마일스톤 */}
      <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-700">누적 거리 목표</span>
          <span
            className="font-extrabold text-sm"
            style={{ color: "var(--color-primary)" }}
          >
            {totalDistance.toFixed(1)} / {MILESTONE_KM} km
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-secondary to-primary"
            style={{ width: `${milestonePct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">{milestonePct.toFixed(1)}% 달성</p>
      </div>

      {/* 포인트 저금 */}
      <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-2">
        <p className="font-bold text-gray-700">포인트 저금</p>
        <p
          className="text-4xl font-extrabold"
          style={{ color: "var(--color-secondary)" }}
        >
          {totalPoints.toLocaleString()}{" "}
          <span className="text-2xl">P</span>
        </p>
        <p className="text-xs text-gray-400">
          운동 거리 1km당 {POINT_RULES.PER_KM}P 적립
        </p>
      </div>

      {/* 운동 통계 */}
      <div className="bg-white rounded-3xl shadow-sm p-5 grid grid-cols-3 gap-3">
        {[
          {
            emoji: "🏃",
            value: `${workoutRecords.length}회`,
            label: "총 운동",
          },
          { emoji: "📍", value: `${totalDistance.toFixed(1)}km`, label: "총 거리" },
          { emoji: "🔥", value: totalCalories.toLocaleString(), label: "총 칼로리" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">{s.emoji}</span>
            <p className="font-extrabold text-gray-800 text-sm">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {showModal && <GoalModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
