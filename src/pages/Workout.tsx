import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import { useActivityType } from "../context/ActivityTypeContext";
import { useUser } from "../context/UserContext";
import { getAvatarCharacterById } from "../data/avatarCharacters";
import { activityTypes } from "../data/activityTypes";
import { storage } from "../utils/storage";
import { POINT_RULES } from "../data/points";
import { calculateStreak, isWeekend } from "../utils/streak";
import { addPoints } from "../lib/pointService";
import { startSession, updateSession, endSession } from "../lib/sessionService";
import { FAKE_ACTIVE_USERS } from "../data/fakeActiveUsers";

const DIET_BY_CHARACTER: Record<
  number,
  { meals: { emoji: string; name: string }[]; tip: string }
> = {
  1: {
    meals: [
      { emoji: "🍚", name: "현미밥" },
      { emoji: "🥬", name: "나물반찬" },
    ],
    tip: "산책 후 가볍게 식이섬유를 채워보세요.",
  },
  2: {
    meals: [
      { emoji: "⚡", name: "에너지바" },
      { emoji: "🥛", name: "우유" },
    ],
    tip: "운동 후 탄수화물+단백질로 빠르게 회복하세요.",
  },
  3: {
    meals: [
      { emoji: "🍌", name: "바나나" },
      { emoji: "🍗", name: "닭가슴살" },
    ],
    tip: "달리기 직후 단백질+탄수화물로 빠르게 회복하세요.",
  },
  4: {
    meals: [
      { emoji: "🥜", name: "견과류" },
      { emoji: "🍎", name: "과일" },
    ],
    tip: "활동 후 지속 에너지를 위해 견과류를 드세요.",
  },
};

const DIET_BY_DURATION = {
  light: {
    label: "가벼운 식단",
    meals: [
      { emoji: "🥗", name: "샐러드" },
      { emoji: "🍓", name: "과일" },
    ],
  },
  protein: {
    label: "단백질 보충",
    meals: [
      { emoji: "🍗", name: "닭가슴살" },
      { emoji: "🥚", name: "삶은계란" },
    ],
  },
};

const GOAL_TYPE_LABEL = {
  steps: "걸음수",
  distance: "거리",
  calories: "칼로리",
};

const SVG_SIZE = 280;
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;
const RADIUS = 108;
const STROKE_W = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type WorkoutState = "idle" | "running" | "paused" | "done";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

export default function Workout() {
  const navigate = useNavigate();
  const { selectedActivityType, selectedId, selectActivityType } = useActivityType();
  const { user, userGoal, saveWorkout, workoutRecords, userProfile } = useUser();

  const [state, setState] = useState<WorkoutState>(
    () => (sessionStorage.getItem("wk_state") as WorkoutState) ?? "idle",
  );
  const [steps, setSteps] = useState<number>(
    () => Number(sessionStorage.getItem("wk_steps") ?? 0),
  );
  const [elapsed, setElapsed] = useState<number>(
    () => Number(sessionStorage.getItem("wk_elapsed") ?? 0),
  );
  const [showStartModal, setShowStartModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [pendingId, setPendingId] = useState<number>(() => selectedId ?? 1);

  // 링 주변에 떠다닐 랜덤 친구 2명
  const buddies = useMemo(() => {
    const shuffled = [...FAKE_ACTIVE_USERS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }, []);

  // 화면 이탈 후 복귀 시 상태 유지
useEffect(() => {
  sessionStorage.setItem("wk_state", state);
  sessionStorage.setItem("wk_steps", String(steps));
  sessionStorage.setItem("wk_elapsed", String(elapsed));
}, [state, steps, elapsed]);

  const characterEmoji = selectedActivityType?.emoji ?? "🏃";
  const characterImage = getAvatarCharacterById(userProfile?.character_id ?? null)?.image ?? null;
  const kcalPerMin = selectedActivityType?.kcalPerMin ?? 4;
  const distance = parseFloat((steps * 0.0008).toFixed(2));
  const calories = Math.floor(kcalPerMin * (elapsed / 60));
  const pointsEarned = Math.max(Math.floor(distance * POINT_RULES.PER_KM), 1);
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;
  const durationLabel =
    elapsedMin > 0 ? `${elapsedMin}분 ${elapsedSec}초` : `${elapsedSec}초`;

  // ── 목표 기반 게이지 ─────────────────────────────────
  const goalType = userGoal?.goal_type ?? "steps";
  const goalValue = userGoal?.goal_value ?? 5000;

  // 오늘 이미 완료된 운동 기록 합산
  const todayIsoKey = new Date().toISOString().split("T")[0];
  const todayRecords = workoutRecords.filter((r) => r.date === todayIsoKey);
  const alreadySteps = todayRecords.reduce((s, r) => s + r.steps, 0);
  const alreadyDistance = todayRecords.reduce((s, r) => s + r.distance, 0);
  const alreadyCalories = todayRecords.reduce((s, r) => s + r.calories, 0);

  const currentGoalValue =
    goalType === "steps"
      ? steps + alreadySteps
      : goalType === "distance"
        ? distance + alreadyDistance
        : calories + alreadyCalories;

  const goalProgress = Math.min((currentGoalValue / goalValue) * 100, 100);

  const remainingText =
    goalType === "steps"
      ? `${Math.max(0, Math.ceil(goalValue - currentGoalValue)).toLocaleString()}보 남음`
      : goalType === "distance"
        ? `${Math.max(0, goalValue - currentGoalValue).toFixed(2)}km 남음`
        : `${Math.max(0, Math.ceil(goalValue - currentGoalValue))}kcal 남음`;

  const goalLabelText = userGoal
    ? `목표 ${goalType === "steps" ? `${goalValue.toLocaleString()}보` : goalType === "distance" ? `${goalValue}km` : `${goalValue}kcal`}`
    : "목표 5,000보";

  const dashOffset = CIRCUMFERENCE * (1 - goalProgress / 100);
  const angle = (goalProgress / 100) * 2 * Math.PI - Math.PI / 2;
  const emojiX = CX + RADIUS * Math.cos(angle);
  const emojiY = CY + RADIUS * Math.sin(angle);

  const charDiet = selectedActivityType
    ? DIET_BY_CHARACTER[selectedActivityType.id]
    : null;
  const durationDiet =
    elapsedMin >= 30 ? DIET_BY_DURATION.protein : DIET_BY_DURATION.light;

  // 목표 달성 시 자동 완료
  useEffect(() => {
    if (state === "running" && goalProgress >= 100) {
      setState("done");
    }
  }, [state, goalProgress]);

  const clearWorkoutSession = () => {
    sessionStorage.removeItem("wk_state");
    sessionStorage.removeItem("wk_steps");
    sessionStorage.removeItem("wk_elapsed");
  };

  const handleStop = async () => {
    const currentCalories = calories;
    const currentElapsed = elapsed;
    setState("paused");
    clearWorkoutSession();
    if (user) endSession(user.id);

    const prevKcal = storage.getBurnedKcal() ?? 0;
    storage.setBurnedKcal(prevKcal + currentCalories);
    storage.addWorkoutToday();

    storage.setRecommendedDiet({
      durationLabel:
        Math.floor(currentElapsed / 60) >= 30
          ? "⏱ 30분 이상 운동 — 단백질 보충 필요!"
          : "⏱ 30분 미만 운동 — 가벼운 식단 추천",
      durationMeals: durationDiet.meals,
      characterEmoji: selectedActivityType?.emoji,
      characterName: selectedActivityType?.name,
      characterMeals: charDiet?.meals,
      tip: charDiet?.tip,
    });

    // ── 포인트 계산 ──────────────────────────────────
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const todayAlreadyWorkedOut = workoutRecords.some((r) => r.date === todayIso);
    const todayGoalAlreadyAchieved = workoutRecords.some(
      (r) => r.date === todayIso && r.goal_achieved,
    );

    let earned = 0;
    earned += pointsEarned;

    if (
      steps >= (userGoal?.goal_type === "steps" ? goalValue : 5000) &&
      !todayGoalAlreadyAchieved
    ) {
      earned += POINT_RULES.GOAL_BONUS;
    }

    const freshHistory = storage.getWorkoutHistory();
    const currentStreak = calculateStreak(freshHistory);
    if (currentStreak > 0 && currentStreak % 7 === 0 && !todayAlreadyWorkedOut) {
      earned += POINT_RULES.STREAK_7_BONUS;
    }

    if (isWeekend(today) && !todayAlreadyWorkedOut) {
      earned += POINT_RULES.WEEKEND_BONUS;
    }

    setEarnedPoints(earned);
    setShowModal(true);
console.log("🔥 saveWorkout 호출됨");
    // ── Supabase 저장 ──────────────────────────────
    const saveResult = await saveWorkout({
      date: todayIso,
      duration: currentElapsed,
      distance,
      steps,
      calories: currentCalories,
      points_earned: earned,
      workout_type: selectedActivityType?.type ?? "walker",
      goal_achieved: goalProgress >= 100,
    });

    if (saveResult.error) {
      console.error("운동 저장 실패 — Supabase 에러:", saveResult.error);
      return;
    }

    // ── point_history 기록 ──────────────────────────────
    if (user) {
      const workoutIcon = selectedActivityType?.emoji ?? "🏃";
      const workoutType = selectedActivityType?.type ?? "walker";
      await addPoints(user.id, pointsEarned, `${distance.toFixed(2)}km 운동 완료`, workoutIcon, workoutType);

      if (steps >= (userGoal?.goal_type === "steps" ? goalValue : 5000) && !todayGoalAlreadyAchieved) {
        await addPoints(user.id, POINT_RULES.GOAL_BONUS, "목표 달성 보너스", "🏆", "goal_bonus");
      }

      if (currentStreak > 0 && currentStreak % 7 === 0 && !todayAlreadyWorkedOut) {
        await addPoints(user.id, POINT_RULES.STREAK_7_BONUS, "7일 연속 달성 보너스", "🔥", "streak");
      }

      if (isWeekend(today) && !todayAlreadyWorkedOut) {
        await addPoints(user.id, POINT_RULES.WEEKEND_BONUS, "주말 운동 보너스", "🌅", "weekend");
      }
    }
  };

  // 세션 시작/종료
  useEffect(() => {
    if (state === "running" && user) {
      startSession(user.id, selectedActivityType?.type ?? "walker");
    }
  }, [state === "running"]);

  // 30초마다 last_seen 갱신
  useEffect(() => {
    if (state !== "running" || !user) return;
    const id = setInterval(() => updateSession(user.id), 30_000);
    return () => clearInterval(id);
  }, [state, user]);

  // 걸음 수 증가 (유형별 페이스)
  useEffect(() => {
    if (state !== "running") return;
    const intervalMap: Record<string, number> = {
      walker: 600,       // 분당 100보
      power_walker: 500, // 분당 120보
      runner: 400,       // 분당 150보
      hiker: 667,        // 분당 90보
    };
    const ms = intervalMap[selectedActivityType?.type ?? "walker"] ?? 600;
    const id = setInterval(() => {
      setSteps((prev) => prev + 1);
    }, ms);
    return () => clearInterval(id);
  }, [state, selectedActivityType]);

  // 타이머 (1초마다)
  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  const stats = [
    { label: "거리", value: distance.toFixed(2), unit: "km", icon: "📍" },
    { label: "걸음수", value: steps.toLocaleString(), unit: "보", icon: "👟" },
    { label: "시간", value: formatTime(elapsed), unit: "", icon: "⏱️" },
    { label: "칼로리", value: String(calories), unit: "kcal", icon: "🔥" },
  ];

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-10 pb-2">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg text-gray-500 active:scale-90 transition"
        >
          ←
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <h1 className="font-extrabold text-gray-800">운동 트래킹</h1>
          {selectedActivityType && (
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              {selectedActivityType.emoji} {selectedActivityType.name} · {kcalPerMin}
              kcal/분
            </span>
          )}
        </div>
        <div className="w-10" />
      </div>

      {/* 목표 뱃지 */}
      <div className="flex justify-center mt-1 mb-0">
        {userGoal ? (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white shadow-sm text-gray-500">
            🎯 {GOAL_TYPE_LABEL[userGoal.goal_type]} 목표 ·{" "}
            {goalValue.toLocaleString()}
            {userGoal.goal_type === "steps"
              ? "보"
              : userGoal.goal_type === "distance"
                ? "km"
                : "kcal"}
          </span>
        ) : (
          <span className="text-xs text-gray-400">
            목표 없음 · 기본 5,000보
          </span>
        )}
      </div>

      {/* 상태 텍스트 */}
      <p
        className="text-center text-sm font-semibold mt-1 mb-0"
        style={{ color: "var(--color-primary)" }}
      >
        {state === "idle" && "시작 버튼을 눌러보세요!"}
        {state === "running" && "🔥 운동 중이에요!"}
        {state === "paused" && <span className="flex items-center gap-1"><FaPause className="inline" /> 일시정지됨</span>}
        {state === "done" && "🎉 목표 달성! 대단해요!"}
      </p>

      {/* 링 + 캐릭터 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
          <svg width={SVG_SIZE} height={SVG_SIZE}>
            <defs>
              <linearGradient id="ringGrad" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-secondary)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="none"
              stroke="var(--color-ring-track)"
              strokeWidth={STROKE_W}
            />
            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth={STROKE_W}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`}
              filter={state === "running" ? "url(#glow)" : undefined}
              style={{ transition: "stroke-dashoffset 0.12s ease" }}
            />
          </svg>

          {state !== "idle" && (
            <div
              className="absolute w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-xl z-10"
              style={{
                left: emojiX - 20,
                top: emojiY - 20,
                transition: "left 0.12s ease, top 0.12s ease",
              }}
            >
              {characterImage
                ? <img src={characterImage} alt="" className="w-full h-full object-contain rounded-full" />
                : <span>{characterEmoji}</span>
              }
            </div>
          )}

          {/* 친구 아바타 - 링 주변에 둥둥 */}
          <div
            className="absolute z-10 buddy-float"
            style={{ left: 200, top: 44 }}
            title={`${buddies[0].nickname}님 ${buddies[0].activity}`}
          >
            <div className="w-9 h-9 rounded-full bg-white shadow-md border-2 border-white overflow-hidden">
              <img src={buddies[0].character_image} alt={buddies[0].nickname} className="w-full h-full object-contain" />
            </div>
            <p className="text-[9px] font-extrabold text-center text-gray-600 mt-0.5 whitespace-nowrap leading-tight">
              {buddies[0].nickname}
            </p>
          </div>
          <div
            className="absolute z-10 buddy-float-delay"
            style={{ left: 28, top: 188 }}
            title={`${buddies[1].nickname}님 ${buddies[1].activity}`}
          >
            <div className="w-9 h-9 rounded-full bg-white shadow-md border-2 border-white overflow-hidden">
              <img src={buddies[1].character_image} alt={buddies[1].nickname} className="w-full h-full object-contain" />
            </div>
            <p className="text-[9px] font-extrabold text-center text-gray-600 mt-0.5 whitespace-nowrap leading-tight">
              {buddies[1].nickname}
            </p>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            {state === "idle" && (
              <button
                onClick={() => {
                  setPendingId(selectedId ?? 1);
                  setShowStartModal(true);
                }}
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                <FaPlay className="text-white text-2xl" />
                <span className="text-white font-extrabold text-xs mt-0.5">
                  시작
                </span>
              </button>
            )}
            {(state === "running" || state === "paused") && (
              <>
                <p className="text-5xl font-extrabold text-gray-800 leading-none">
                  {Math.floor(goalProgress)}
                  <span className="text-2xl text-gray-400">%</span>
                </p>
                <p className="text-xs text-gray-400 mt-1 font-semibold">
                  {goalLabelText}
                </p>
                <p
                  className="text-xs font-bold mt-2"
                  style={{ color: "var(--color-primary)" }}
                >
                  {remainingText}
                </p>
              </>
            )}
            {state === "done" && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-5xl">🎉</span>
                <p
                  className="font-extrabold text-xl"
                  style={{ color: "var(--color-primary)" }}
                >
                  완료!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 스탯 카드 */}
        <div className="w-full grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1 shadow-sm"
            >
              <span className="text-lg">{s.icon}</span>
              <p className="font-extrabold text-gray-800 text-sm leading-none">
                {s.value}
              </p>
              <p className="text-[10px] text-gray-400">{s.unit || s.label}</p>
            </div>
          ))}
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex gap-3 w-full pb-10">
          {state === "idle" && (
            <button
              onClick={() => {
                setPendingId(selectedId ?? 1);
                setShowStartModal(true);
              }}
              className="flex-1 py-4 rounded-2xl text-white font-extrabold shadow-md active:scale-95 transition flex items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >운동 시작
            </button>
          )}
          {state === "running" && (
            <>
              <button
                onClick={() => setState("paused")}
                className="flex-1 py-4 rounded-2xl bg-white shadow-sm font-extrabold text-gray-600 border border-gray-100 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <FaPause className="text-gray-500 text-base" /> 일시정지
              </button>
              <button
                onClick={handleStop}
                className="flex-1 py-4 rounded-2xl bg-gray-100 font-extrabold text-gray-500 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <FaStop className="text-gray-400 text-base" /> 종료
              </button>
            </>
          )}
          {state === "paused" && (
            <>
              <button
                onClick={() => setState("running")}
                className="flex-1 py-4 rounded-2xl text-white font-extrabold shadow-md active:scale-95 transition flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                <FaPlay className="text-white text-base" /> 재개
              </button>
              <button
                onClick={handleStop}
                className="flex-1 py-4 rounded-2xl bg-gray-100 font-extrabold text-gray-500 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <FaStop className="text-gray-400 text-base" /> 종료
              </button>
            </>
          )}
          {state === "done" && (
            <button
              onClick={handleStop}
              className="flex-1 py-4 rounded-2xl text-white font-extrabold shadow-md active:scale-95 transition"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              🎉 결과 보기
            </button>
          )}
        </div>
      </div>

      {/* 운동 시작 팝업 */}
      {showStartModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowStartModal(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-extrabold text-gray-800 text-lg">
                운동 유형 선택
              </p>
              <button
                onClick={() => setShowStartModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              선택한 유형으로 칼로리가 계산돼요
            </p>
            <div className="flex flex-col gap-3 mb-5">
              {activityTypes.map((c) => {
                const isActive = pendingId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setPendingId(c.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      isActive
                        ? `${c.bg} ${c.border}`
                        : "bg-gray-50 border-transparent"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-2xl flex-shrink-0`}
                    >
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-gray-800 text-sm">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-400">{c.style}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="font-extrabold text-sm"
                        style={{
                          color: isActive ? "var(--color-primary)" : "#9ca3af",
                        }}
                      >
                        {c.kcalPerMin}kcal/분
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {c.bonusIcon} {c.bonus}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                selectActivityType(pendingId);
                setShowStartModal(false);
                setState("running");
              }}
              className="w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              시작하기
            </button>
          </div>
        </div>
      )}

      {/* 완료 팝업 */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div
              className="flex flex-col items-center py-8 gap-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              <span className="text-5xl">
                {goalProgress >= 100 ? "🎉" : "💪"}
              </span>
              <p className="text-white font-extrabold text-2xl mt-1">
                운동 완료!
              </p>
              <p className="text-white/70 text-sm">
                {goalProgress >= 100
                  ? "목표 달성! 정말 잘 했어요 🏆"
                  : "오늘도 정말 잘 했어요"}
              </p>
            </div>

            {goalProgress >= 100 && (
              <div
                className="mx-5 mt-4 px-4 py-3 rounded-2xl flex items-center gap-2"
                style={{ background: "var(--color-primary-light)" }}
              >
                <span className="text-lg">🏆</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--color-primary)" }}
                >
                  목표 달성 완료!
                </span>
              </div>
            )}

            <div className="px-6 py-5 flex flex-col gap-3">
              {[
                {
                  icon: "📍",
                  label: "거리",
                  value: `${distance.toFixed(2)} km`,
                },
                {
                  icon: "👟",
                  label: "걸음 수",
                  value: `${steps.toLocaleString()} 보`,
                },
                { icon: "⏱️", label: "운동 시간", value: durationLabel },
                { icon: "🔥", label: "칼로리", value: `${calories} kcal` },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-2 border-b border-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{row.icon}</span>
                    <span className="text-sm text-gray-500 font-semibold">
                      {row.label}
                    </span>
                  </div>
                  <span className="font-extrabold text-gray-800">
                    {row.value}
                  </span>
                </div>
              ))}

              <div
                className="mt-1 rounded-2xl flex items-center justify-between px-4 py-3"
                style={{ background: "var(--color-primary-light)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    획득 포인트
                  </span>
                </div>
                <span
                  className="text-xl font-extrabold"
                  style={{ color: "var(--color-primary)" }}
                >
                  +{earnedPoints} P
                </span>
              </div>
            </div>

            <div className="px-6 pb-2">
              <div
                className="rounded-2xl p-4"
                style={{ background: "var(--color-bg, #f9fafb)" }}
              >
                <p className="font-extrabold text-gray-800 text-sm mb-3">
                  오늘 추천 식단 🥗
                </p>
                <div className="mb-3">
                  <p className="text-[11px] text-gray-400 font-semibold mb-1.5">
                    {elapsedMin >= 30
                      ? "⏱ 30분 이상 운동 — 단백질 보충 필요!"
                      : "⏱ 30분 미만 운동 — 가벼운 식단 추천"}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {durationDiet.meals.map((m) => (
                      <span
                        key={m.name}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white shadow-sm border border-gray-100"
                      >
                        {m.emoji} {m.name}
                      </span>
                    ))}
                  </div>
                </div>
                {charDiet && (
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold mb-1.5">
                      {selectedActivityType!.emoji} {selectedActivityType!.name} 맞춤
                      식단
                    </p>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {charDiet.meals.map((m) => (
                        <span
                          key={m.name}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                          }}
                        >
                          {m.emoji} {m.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-snug">
                      💡 {charDiet.tip}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4">
              <button
                onClick={() => { clearWorkoutSession(); navigate("/community"); }}
                className="w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                📝 오늘 기록 남기러 가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
