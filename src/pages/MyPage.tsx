import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useCharacter } from "../context/ActivityTypeContext";
import { activityTypes } from "../data/activityTypes";
import { type UserGoal } from "../lib/workoutService";
import Diet from "./Diet";

const WORKOUT_TYPE_LABEL: Record<string, { label: string; emoji: string }> = {
  walker: { label: "걷기", emoji: "🚶" },
  power_walker: { label: "파워워킹", emoji: "🚶‍♂️" },
  runner: { label: "달리기", emoji: "🏃" },
  hiker: { label: "등산", emoji: "🏔️" },
};

const GOAL_OPTIONS: {
  type: UserGoal["goal_type"];
  label: string;
  icon: string;
  placeholder: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}[] = [
  {
    type: "steps",
    label: "걸음수",
    icon: "👟",
    placeholder: "예: 8000",
    unit: "보",
    min: 1000,
    max: 50000,
    step: 500,
  },
  {
    type: "distance",
    label: "거리",
    icon: "📍",
    placeholder: "예: 3",
    unit: "km",
    min: 0.5,
    max: 100,
    step: 0.5,
  },
  {
    type: "calories",
    label: "칼로리",
    icon: "🔥",
    placeholder: "예: 300",
    unit: "kcal",
    min: 50,
    max: 5000,
    step: 50,
  },
];

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

// ── 목표 설정 모달 ───────────────────────────────────────
function GoalSetModal({ onClose }: { onClose: () => void }) {
  const { userGoal, saveGoal } = useUser();
  const [selectedType, setSelectedType] = useState<UserGoal["goal_type"]>(
    userGoal?.goal_type ?? "steps",
  );
  const [value, setValue] = useState<string>(
    userGoal ? String(userGoal.goal_value) : "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOption = GOAL_OPTIONS.find((o) => o.type === selectedType)!;

  async function handleSave() {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setError("올바른 숫자를 입력해주세요.");
      return;
    }
    setIsSaving(true);
    const result = await saveGoal(selectedType, num);
    setIsSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-extrabold text-gray-800">
            목표 설정하기
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-5">
          달성하고 싶은 목표 유형을 선택하세요
        </p>

        {/* 목표 유형 선택 */}
        <div className="flex gap-2 mb-5">
          {GOAL_OPTIONS.map((opt) => {
            const isActive = selectedType === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => {
                  setSelectedType(opt.type);
                  setValue("");
                  setError(null);
                }}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all ${
                  isActive
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                <span
                  className={`text-xs font-bold ${isActive ? "text-[var(--color-primary)]" : "text-gray-500"}`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 목표 값 입력 */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 mb-2">
          <span className="text-2xl">{selectedOption.icon}</span>
          <input
            type="number"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder={selectedOption.placeholder}
            min={selectedOption.min}
            max={selectedOption.max}
            step={selectedOption.step}
            className="flex-1 bg-transparent text-lg font-extrabold text-gray-800 outline-none placeholder:text-gray-300"
          />
          <span className="text-sm font-bold text-gray-400">
            {selectedOption.unit}
          </span>
        </div>
        {error && <p className="text-xs text-red-500 mb-2 px-1">{error}</p>}

        {userGoal && (
          <p className="text-xs text-gray-400 mb-4 px-1">
            현재 목표:{" "}
            {userGoal.goal_type === "steps"
              ? "걸음수"
              : userGoal.goal_type === "distance"
                ? "거리"
                : "칼로리"}{" "}
            {userGoal.goal_value.toLocaleString()}
            {userGoal.goal_type === "steps"
              ? "보"
              : userGoal.goal_type === "distance"
                ? "km"
                : "kcal"}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving || !value}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition shadow-md disabled:opacity-50"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          }}
        >
          {isSaving ? "저장 중..." : "목표 저장하기"}
        </button>
      </div>
    </div>
  );
}

// ── 캐릭터 선택 시트 ────────────────────────────────────
function CharacterSheet({ onClose }: { onClose: () => void }) {
  const { selectedId, selectActivityType } = useCharacter();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-gray-800">캐릭터 변경</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          나에게 맞는 운동 스타일을 골라봐!
        </p>
        <div className="flex flex-col gap-3">
          {activityTypes.map((c) => {
            const isSelected = selectedId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  selectActivityType(c.id);
                  onClose();
                }}
                className={`w-full rounded-3xl p-4 text-left transition-all duration-200 border-2 ${
                  isSelected
                    ? `${c.bg} ${c.border} shadow-md scale-[1.01]`
                    : "bg-white border-transparent shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}
                  >
                    <span className="text-2xl">{c.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-800 text-sm">
                        {c.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-white bg-[var(--color-primary)] rounded-full px-2 py-0.5">
                          선택됨
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{c.style}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs">{c.bonusIcon}</span>
                      <span className="text-[11px] font-semibold text-gray-500">
                        {c.bonus}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? `bg-gradient-to-br ${c.gradient} border-transparent`
                        : "border-gray-200"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-white text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 내정보 탭 ───────────────────────────────────────────
function InfoTab() {
  const { userProfile, updateProfile, userGoal, deleteGoal } = useUser();
  const { selectedActivityType } = useCharacter();
  const [showSheet, setShowSheet] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [height, setHeight] = useState<string>(
    () => userProfile?.height?.toString() ?? "",
  );
  const [weight, setWeight] = useState<string>(
    () => userProfile?.weight?.toString() ?? "",
  );
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const h = parseFloat(height);
  const w = parseFloat(weight);
  const bmiCalc =
    h > 0 && w > 0 ? parseFloat((w / (h / 100) ** 2).toFixed(1)) : null;
  const bmi = editing
    ? (bmiCalc?.toFixed(1) ?? null)
    : (userProfile?.bmi?.toFixed(1) ?? null);

  function getBmiLabel(bmi: number) {
    if (bmi < 18.5) return { label: "저체중", color: "text-blue-500" };
    if (bmi < 23) return { label: "정상", color: "text-green-500" };
    if (bmi < 25) return { label: "과체중", color: "text-yellow-500" };
    return { label: "비만", color: "text-red-500" };
  }

  async function handleSave() {
    setIsSaving(true);
    await updateProfile({ height: h || null, weight: w || null, bmi: bmiCalc });
    setIsSaving(false);
    setEditing(false);
  }

  async function handleDeleteGoal() {
    setIsDeleting(true);
    await deleteGoal();
    setIsDeleting(false);
    setDeleteConfirm(false);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-20 h-full overflow-y-auto">
      {/* 캐릭터 & 닉네임 */}
      <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col items-center gap-3">
        <div
          className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${
            selectedActivityType?.gradient ?? "from-gray-200 to-gray-300"
          } flex items-center justify-center shadow-md`}
        >
          <span className="text-5xl">{selectedActivityType?.emoji ?? "👤"}</span>
        </div>
        <div className="text-center">
          <p className="text-xl font-extrabold text-gray-800">
            {userProfile?.nickname ?? "닉네임 없음"}
          </p>
          {selectedActivityType && (
            <p className="text-sm text-gray-400 mt-0.5">
              {selectedActivityType.name}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowSheet(true)}
          className="mt-1 px-5 py-2 rounded-2xl text-sm font-bold text-white shadow-sm active:scale-95 transition-all"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          }}
          aria-label="캐릭터 변경하기"
        >
          캐릭터 변경하기
        </button>
      </div>

      {/* 목표 설정 카드 */}
      <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-gray-800">운동 목표</p>
          <button
            onClick={() => setShowGoalModal(true)}
            className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full"
          >
            {userGoal ? "목표 변경" : "목표 설정"}
          </button>
        </div>
        {userGoal ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
              <span className="text-2xl">
                {userGoal.goal_type === "steps"
                  ? "👟"
                  : userGoal.goal_type === "distance"
                    ? "📍"
                    : "🔥"}
              </span>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-semibold">
                  {userGoal.goal_type === "steps"
                    ? "걸음수"
                    : userGoal.goal_type === "distance"
                      ? "거리"
                      : "칼로리"}{" "}
                  목표
                </p>
                <p className="font-extrabold text-gray-800">
                  {userGoal.goal_value.toLocaleString()}
                  {userGoal.goal_type === "steps"
                    ? "보"
                    : userGoal.goal_type === "distance"
                      ? "km"
                      : "kcal"}
                </p>
              </div>
            </div>
            {deleteConfirm ? (
              <div className="flex items-center gap-2 px-1">
                <p className="text-xs text-gray-500 flex-1">
                  정말 목표를 삭제할까요?
                </p>
                <button
                  onClick={handleDeleteGoal}
                  disabled={isDeleting}
                  className="text-xs font-bold text-red-500 disabled:opacity-50 px-2 py-1"
                >
                  {isDeleting ? "삭제 중..." : "삭제"}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="text-xs font-bold text-gray-400 px-2 py-1"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-xs text-red-400 font-semibold self-end pr-1"
              >
                목표 삭제
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-semibold active:scale-95 transition"
          >
            <span>＋</span>
            목표 설정하기
          </button>
        )}
      </div>

      {/* 신체 정보 */}
      <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-gray-800">신체 정보</p>
          <button
            onClick={() => (editing ? handleSave() : setEditing(true))}
            disabled={isSaving}
            className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full disabled:opacity-50"
          >
            {editing ? (isSaving ? "저장 중..." : "저장") : "편집"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-2xl p-3">
            <span className="text-lg">📏</span>
            <p className="text-[10px] text-gray-400 font-semibold">키</p>
            {editing ? (
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="cm"
                className="w-full text-center text-sm font-extrabold text-gray-800 bg-white border border-gray-200 rounded-xl px-1 py-0.5 outline-none focus:border-[var(--color-primary)]"
              />
            ) : (
              <p className="text-sm font-extrabold text-gray-800">
                {userProfile?.height ? `${userProfile.height}cm` : "—"}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-2xl p-3">
            <span className="text-lg">⚖️</span>
            <p className="text-[10px] text-gray-400 font-semibold">몸무게</p>
            {editing ? (
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="kg"
                className="w-full text-center text-sm font-extrabold text-gray-800 bg-white border border-gray-200 rounded-xl px-1 py-0.5 outline-none focus:border-[var(--color-primary)]"
              />
            ) : (
              <p className="text-sm font-extrabold text-gray-800">
                {userProfile?.weight ? `${userProfile.weight}kg` : "—"}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-2xl p-3">
            <span className="text-lg">📊</span>
            <p className="text-[10px] text-gray-400 font-semibold">BMI</p>
            {bmi ? (
              <>
                <p className="text-sm font-extrabold text-gray-800">{bmi}</p>
                <p
                  className={`text-[10px] font-bold ${getBmiLabel(parseFloat(bmi)).color}`}
                >
                  {getBmiLabel(parseFloat(bmi)).label}
                </p>
              </>
            ) : (
              <p className="text-sm font-extrabold text-gray-800">—</p>
            )}
          </div>
        </div>
      </div>

      {showSheet && <CharacterSheet onClose={() => setShowSheet(false)} />}
      {showGoalModal && (
        <GoalSetModal onClose={() => setShowGoalModal(false)} />
      )}
    </div>
  );
}

// ── 운동기록 탭 ─────────────────────────────────────────
function WorkoutTab() {
  const { workoutRecords, refreshWorkoutHistory } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    await refreshWorkoutHistory();
    setIsRefreshing(false);
  }

  const totalKcal = workoutRecords.reduce((s, r) => s + r.calories, 0);
  const totalPoints = workoutRecords.reduce((s, r) => s + r.points_earned, 0);

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
            획득 포인트
          </span>
          <span className="text-white font-extrabold text-lg">
            {totalPoints.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 새로고침 버튼 */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="text-xs font-bold text-[var(--color-primary)] text-right disabled:opacity-50"
      >
        {isRefreshing ? "불러오는 중..." : "↻ 새로고침"}
      </button>

      {/* 기록 목록 */}
      <div className="flex flex-col gap-3">
        {workoutRecords.map((record) => {
          const typeInfo = WORKOUT_TYPE_LABEL[record.workout_type] ?? {
            label: record.workout_type,
            emoji: "🏃",
          };
          return (
            <div
              key={record.id ?? record.created_at}
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
                  <div className="flex items-center gap-1.5">
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
                  <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-full px-2 py-0.5">
                    +{record.points_earned}P
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(record.date)}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[11px] text-gray-500 font-semibold">
                    🕐 {formatDuration(record.duration)}
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

// ── MyPage 메인 ─────────────────────────────────────────
type Tab = "info" | "diet" | "workout";

const tabs: { id: Tab; label: string }[] = [
  { id: "info", label: "내정보" },
  { id: "diet", label: "식단" },
  { id: "workout", label: "운동기록" },
];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<Tab>("info");

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-t-xl transition-colors ${
              activeTab === t.id
                ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                : "text-gray-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "info" && <InfoTab />}
        {activeTab === "diet" && <Diet />}
        {activeTab === "workout" && <WorkoutTab />}
      </div>
    </div>
  );
}
