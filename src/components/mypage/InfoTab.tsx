import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoFootsteps, IoLocationSharp, IoFlame } from "react-icons/io5";
import { useAchievements } from "../../hooks/useAchievements";
import { useUser } from "../../context/UserContext";
import { useActivityType } from "../../context/ActivityTypeContext";
import { useCharacter } from "../../context/CharacterContext";
import CharacterGrid from "../CharacterGrid";
import Modal from "../ui/Modal";
import { activityTypes } from "../../data/activityTypes";
import { type UserGoal } from "../../lib/workoutService";
import { localDateStr } from "../../utils/streak";

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

// ── 활동 유형 선택 시트 ────────────────────────────────────
function ActivityTypeSheet({ onClose }: { onClose: () => void }) {
  const { selectedId, selectActivityType } = useActivityType();
  const [pendingActivityTypeId, setPendingActivityTypeId] = useState<
    number | null
  >(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const pendingActivityType =
    activityTypes.find((type) => type.id === pendingActivityTypeId) ?? null;
  const checkedActivityTypeId = pendingActivityTypeId ?? selectedId;

  function handleConfirm() {
    if (pendingActivityTypeId === null) return;
    selectActivityType(pendingActivityTypeId);
    setPendingActivityTypeId(null);
    setShowConfirmModal(false);
    onClose();
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end bg-black/40"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-gray-800">
              활동유형 변경
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            나에게 맞는 운동 스타일을 골라봐! <br />
            활동 유형에 따라 운동 기록과 분석 방식이 달라져요
          </p>
          <div className="flex flex-col gap-3 pb-5">
            {activityTypes.map((c) => {
              const isSelected = selectedId === c.id;
              const isChecked = checkedActivityTypeId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setPendingActivityTypeId(c.id)}
                  className={`w-full rounded-3xl p-4 text-left transition-all duration-200 border-2 ${
                    isChecked
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
                        {!isSelected && isChecked && (
                          <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-full px-2 py-0.5">
                            변경 예정
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{c.style}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isChecked
                          ? `bg-gradient-to-br ${c.gradient} border-transparent`
                          : "border-gray-200"
                      }`}
                    >
                      {isChecked && (
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
          <div className="sticky bottom-0 -mx-5 -mb-4 bg-white/95 px-5 pt-3 pb-8 backdrop-blur">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={
                pendingActivityTypeId === null ||
                pendingActivityTypeId === selectedId
              }
              className="w-full py-4 rounded-2xl text-white font-extrabold text-base shadow-md active:scale-95 transition disabled:opacity-40 disabled:active:scale-100"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              확인
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={showConfirmModal && pendingActivityType !== null}
        title="활동유형을 변경할까요?"
        message={`${pendingActivityType?.name ?? ""} 유형으로 변경할게요.`}
        onConfirm={handleConfirm}
        onClose={() => setShowConfirmModal(false)}
      />
    </>
  );
}

// ── 캐릭터 선택 시트 ────────────────────────────────────
function CharacterSheet({ onClose }: { onClose: () => void }) {
  const { selectedCharacterId, selectCharacter } = useCharacter();
  const [pendingCharacterId, setPendingCharacterId] = useState<string | null>(
    null,
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkedCharacterId = pendingCharacterId ?? selectedCharacterId;

  async function handleConfirm() {
    if (pendingCharacterId === null) return;
    setIsSaving(true);
    setError(null);
    const result = await selectCharacter(pendingCharacterId);
    setIsSaving(false);
    if (result.error) {
      setError(result.error);
      setShowConfirmModal(false);
      return;
    }
    setPendingCharacterId(null);
    setShowConfirmModal(false);
    onClose();
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end bg-black/40"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-gray-800">
              캐릭터 변경
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            홈과 마이페이지에 표시할 캐릭터를 골라주세요.
          </p>
          <CharacterGrid
            selectedId={checkedCharacterId}
            onSelect={setPendingCharacterId}
            disabled={isSaving}
          />
          {error && (
            <p className="mt-3 text-xs font-semibold text-red-500">{error}</p>
          )}
          <div className="sticky bottom-0 -mx-5 -mb-8 bg-white/95 px-5 pt-3 pb-8 backdrop-blur">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={
                pendingCharacterId === null ||
                pendingCharacterId === selectedCharacterId ||
                isSaving
              }
              className="w-full py-4 rounded-2xl text-white font-extrabold text-base shadow-md active:scale-95 transition disabled:opacity-40 disabled:active:scale-100"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              {isSaving ? "저장 중..." : "확인"}
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={showConfirmModal && pendingCharacterId !== null}
        title="캐릭터를 변경할까요?"
        message="선택한 캐릭터로 프로필을 변경할게요."
        onConfirm={handleConfirm}
        onClose={() => setShowConfirmModal(false)}
      />
    </>
  );
}

// ── 내정보 탭 ───────────────────────────────────────────
export default function InfoTab() {
  const navigate = useNavigate();
  const { unlockedCount, total } = useAchievements();
  const { userProfile, updateProfile, userGoal, deleteGoal, workoutRecords } =
    useUser();
  const { selectedActivityType } = useActivityType();
  const { selectedCharacter } = useCharacter();

  const today = localDateStr(new Date());
  const todayStats = workoutRecords
    .filter((r) => r.date === today)
    .reduce(
      (acc, r) => ({
        steps: acc.steps + (r.steps ?? 0),
        distance: acc.distance + (r.distance ?? 0),
        calories: acc.calories + (r.calories ?? 0),
      }),
      { steps: 0, distance: 0, calories: 0 },
    );

  const [showActivityTypeSheet, setShowActivityTypeSheet] = useState(false);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBmiInfo, setShowBmiInfo] = useState(false);

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
        <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden border border-gray-100">
          {selectedCharacter ? (
            <img
              src={selectedCharacter.image}
              alt=""
              className="h-26 w-26 object-contain scale-110"
              draggable={false}
            />
          ) : (
            <span className="text-5xl">
              {selectedActivityType?.emoji ?? "👤"}
            </span>
          )}
        </div>
        <div className="text-center">
          {userProfile?.title && (
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              {userProfile.title}
            </span>
          )}
          <p className="text-xl font-extrabold text-gray-800">
            {userProfile?.nickname ?? "닉네임 없음"}
          </p>
          {selectedActivityType && (
            <p className="text-sm text-gray-400 mt-0.5">
              {selectedActivityType.name}
            </p>
          )}
        </div>
        <div className="mt-1 grid w-full grid-cols-3 gap-2">
          <button
            onClick={() => setShowActivityTypeSheet(true)}
            className="px-2 py-2 rounded-2xl text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
            }}
            aria-label="활동유형 변경하기"
          >
            활동유형
          </button>
          <button
            onClick={() => setShowCharacterSheet(true)}
            className="px-2 py-2 rounded-2xl text-xs font-bold border-2 bg-white shadow-sm active:scale-95 transition-all"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
            }}
            aria-label="캐릭터 변경하기"
          >
            캐릭터
          </button>
          <button
            onClick={() => navigate("/achievements-image")}
            className="px-2 py-2 rounded-2xl text-xs font-bold border-2 bg-white shadow-sm active:scale-95 transition-all flex flex-col items-center gap-0.5"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
            }}
            aria-label="업적 보기"
          >
            <span>업적달성</span>
            <span className="text-[9px] font-semibold opacity-70">
              {unlockedCount}/{total}
            </span>
          </button>
        </div>
      </div>

      {/* 오늘 현황 카드 */}
      <div className="bg-white rounded-3xl shadow-sm p-5">
        <p className="font-extrabold text-gray-800 mb-3">오늘 현황</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "걸음수",
              value: todayStats.steps.toLocaleString(),
              unit: "보",
              icon: <IoFootsteps className="text-2xl text-emerald-500" />,
            },
            {
              label: "거리",
              value: todayStats.distance.toFixed(2),
              unit: "km",
              icon: <IoLocationSharp className="text-2xl text-blue-500" />,
            },
            {
              label: "칼로리",
              value: Math.round(todayStats.calories).toLocaleString(),
              unit: "kcal",
              icon: <IoFlame className="text-2xl text-orange-500" />,
            },
          ].map(({ label, value, unit, icon }) => (
            <div
              key={label}
              className="flex flex-col items-center bg-gray-50 rounded-2xl py-5 gap-2"
            >
              {icon}
              <p className="text-lg font-extrabold leading-tight text-gray-800">
                {value}
                <span className="text-xs text-gray-400 font-normal ml-0.5">
                  {unit}
                </span>
              </p>
              <p className="text-[10px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>
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
          <button
            onClick={() => setShowBmiInfo(true)}
            className="flex flex-col items-center gap-1 bg-gray-50 rounded-2xl p-3 active:scale-95 transition-transform"
            aria-label="BMI 설명 보기"
          >
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
          </button>
        </div>
      </div>

      {showActivityTypeSheet && (
        <ActivityTypeSheet onClose={() => setShowActivityTypeSheet(false)} />
      )}
      {showCharacterSheet && (
        <CharacterSheet onClose={() => setShowCharacterSheet(false)} />
      )}
      {showGoalModal && (
        <GoalSetModal onClose={() => setShowGoalModal(false)} />
      )}
      {showBmiInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowBmiInfo(false)}
        >
          <div
            className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-extrabold text-gray-800">BMI란?</p>
              <button
                onClick={() => setShowBmiInfo(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              체질량지수(Body Mass Index)로 체중(kg)을 키(m)의 제곱으로 나눈
              값이에요.
            </p>
            <p className="text-xs font-bold text-center text-gray-600 bg-gray-50 rounded-2xl py-2.5">
              BMI = 체중(kg) ÷ 키(m)²
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { range: "18.5 미만", label: "저체중", color: "text-blue-500" },
                {
                  range: "18.5 ~ 22.9",
                  label: "정상",
                  color: "text-green-500",
                },
                {
                  range: "23 ~ 24.9",
                  label: "과체중",
                  color: "text-yellow-500",
                },
                { range: "25 이상", label: "비만", color: "text-red-500" },
              ].map(({ range, label, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-2.5"
                >
                  <span className="text-xs text-gray-500 font-semibold">
                    {range}
                  </span>
                  <span className={`text-sm font-extrabold ${color}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              💡 BMI는 근육량을 반영하지 않아 참고 지표로만 활용하세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
