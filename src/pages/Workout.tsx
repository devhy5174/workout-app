import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaPause, FaStop, FaUsers } from "react-icons/fa";
import { useActivityType } from "../context/ActivityTypeContext";
import { useUser } from "../context/UserContext";
import { getAvatarCharacterById } from "../data/avatarCharacters";
import { activityTypes } from "../data/activityTypes";
import { storage } from "../utils/storage";
import { startSession, updateSession, endSession } from "../lib/sessionService";
import { useActiveBubble } from "../context/ActiveBubbleContext";
import { FAKE_ACTIVE_USERS } from "../data/fakeActiveUsers";
import { DIET_BY_CHARACTER } from "../data/characterWorkoutDiet";
import { useTodayStats } from "../hooks/useTodayStats";
import { notifyGoalReached } from "../utils/notificationTriggers";

const WK_KEY = {
  state: "wk_state",
  steps: "wk_steps",
  elapsed: "wk_elapsed",
  resumeAt: "wk_resume_at",
  stepsAt: "wk_steps_at",
  activityType: "wk_activity_type",
};

// 활동 유형별 분당 걸음수
const STEPS_PER_SEC: Record<string, number> = {
  walker: 100 / 60,
  power_walker: 120 / 60,
  runner: 150 / 60,
  hiker: 90 / 60,
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

const ACTIVITY_LABEL: Record<string, string> = {
  walker: "워킹 중",
  power_walker: "파워워킹 중",
  runner: "러닝 중",
  hiker: "등산 중",
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
  const { selectedActivityType, selectedId, selectActivityType } =
    useActivityType();
  const { user, userGoal, saveWorkout, userProfile } =
    useUser();
  const { todayStats } = useTodayStats(user?.id ?? null);
  const { selectedBubbleId } = useActiveBubble();

  const [state, setState] = useState<WorkoutState>(
    () => (localStorage.getItem(WK_KEY.state) as WorkoutState) ?? "idle",
  );
  const [steps, setSteps] = useState<number>(() =>
    Number(localStorage.getItem(WK_KEY.steps) ?? 0),
  );
  const [elapsed, setElapsed] = useState<number>(() =>
    Number(localStorage.getItem(WK_KEY.elapsed) ?? 0),
  );
  const [showStartModal, setShowStartModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingId, setPendingId] = useState<number>(() => selectedId ?? 1);

  const [showBuddies, setShowBuddies] = useState(true);
  const [tooShort, setTooShort] = useState(false);
  const isSaved = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const stepsRef = useRef(steps);
  useEffect(() => { stepsRef.current = steps; }, [steps]);

  // 링 주변 공전할 친구 2명
  const buddies = useMemo(() => {
    const shuffled = [...FAKE_ACTIVE_USERS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }, []);

  // 상태 localStorage 동기화
  useEffect(() => {
    localStorage.setItem(WK_KEY.state, state);
    localStorage.setItem(WK_KEY.steps, String(steps));
    localStorage.setItem(WK_KEY.elapsed, String(elapsed));
  }, [state, steps, elapsed]);

  const characterEmoji = selectedActivityType?.emoji ?? "🏃";
  const characterImage =
    getAvatarCharacterById(userProfile?.character_id ?? null)?.image ?? null;
  const kcalPerMin = selectedActivityType?.kcalPerMin ?? 4;
  const distance = parseFloat((steps * 0.0008).toFixed(2));
  const calories = Math.floor(kcalPerMin * (elapsed / 60));
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;
  const durationLabel =
    elapsedMin > 0 ? `${elapsedMin}분 ${elapsedSec}초` : `${elapsedSec}초`;

  // ── 목표 기반 게이지 ─────────────────────────────────
  const goalType = userGoal?.goal_type ?? "steps";
  const goalValue = userGoal?.goal_value ?? 5000;

  const alreadySteps = todayStats.steps;
  const alreadyDistance = todayStats.distance;
  const alreadyCalories = todayStats.calories;

  const sessionSteps = steps;
  const sessionDistance = distance;
  const sessionCalories = calories;

  const currentGoalValue =
    goalType === "steps"
      ? sessionSteps
      : goalType === "distance"
        ? sessionDistance
        : sessionCalories;

  const todayTotalText =
    goalType === "steps"
      ? `오늘 누적 ${alreadySteps.toLocaleString()}보`
      : goalType === "distance"
        ? `오늘 누적 ${alreadyDistance.toFixed(2)}km`
        : `오늘 누적 ${alreadyCalories}kcal`;

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

  // 목표 달성 시 자동 완료 + 1회 저장
  useEffect(() => {
    if (state === "running" && goalProgress >= 100) {
      setState("done");
      performSave();
    }
  }, [state, goalProgress]);

  const clearWorkoutSession = () => {
    Object.values(WK_KEY).forEach((k) => localStorage.removeItem(k));
  };

  const performSave = async () => {
    if (isSaved.current) return;
    isSaved.current = true;

    if (elapsed < 30 || steps < 50) {
      setTooShort(true);
      clearWorkoutSession();
      if (user) endSession(user.id);
      return;
    }
    setTooShort(false);

    const currentCalories = calories;
    const currentElapsed = elapsed;

    if (user) endSession(user.id);

    storage.setBurnedKcal((storage.getBurnedKcal() ?? 0) + currentCalories);
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

    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const saveResult = await saveWorkout({
      date: todayIso,
      duration: currentElapsed,
      distance,
      steps,
      calories: currentCalories,
      workout_type: selectedActivityType?.type ?? "walker",
      goal_achieved: goalProgress >= 100,
    });

    if (saveResult.error) {
      console.error("운동 저장 실패 — Supabase 에러:", saveResult.error);
      return;
    }

    // 목표 달성 알림 (fire-and-forget)
    if (goalProgress >= 100 && user && userGoal) {
      notifyGoalReached({
        userId: user.id,
        goalType: userGoal.goal_type,
        goalValue: userGoal.goal_value,
      }).catch(() => {});
    }
  };

  const handleStop = async () => {
    setState("done");
    await performSave();
    setShowModal(true);
  };

  // 앱 재실행 시 백그라운드 경과 시간 복구
  useEffect(() => {
    if (state !== "running") return;
    const resumeAt = Number(localStorage.getItem(WK_KEY.resumeAt) ?? 0);
    if (!resumeAt) return;
    const missedSec = Math.floor((Date.now() - resumeAt) / 1000);
    if (missedSec <= 2) return;
    const actType = localStorage.getItem(WK_KEY.activityType) ?? selectedActivityType?.type ?? "walker";
    const missedSteps = Math.round(missedSec * (STEPS_PER_SEC[actType] ?? STEPS_PER_SEC.walker));
    setElapsed((prev) => prev + missedSec);
    setSteps((prev) => prev + missedSteps);
    localStorage.removeItem(WK_KEY.resumeAt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wake Lock: 운동 중 화면 자동 꺼짐 방지
  useEffect(() => {
    if (state !== "running") {
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
      return;
    }
    if (!("wakeLock" in navigator)) return;
    navigator.wakeLock.request("screen").then((lock) => {
      wakeLockRef.current = lock;
    }).catch(() => {});
    // 화면이 잠깐 꺼졌다 켜지면 재요청
    const onVisible = () => {
      if (document.visibilityState === "visible" && !wakeLockRef.current) {
        navigator.wakeLock.request("screen").then((lock) => {
          wakeLockRef.current = lock;
        }).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [state]);

  // 세션 시작/종료
  useEffect(() => {
    if (state === "running" && user) {
      startSession(user.id, selectedActivityType?.type ?? "walker", selectedBubbleId);
    }
  }, [state === "running"]);

  // 30초마다 last_seen 갱신
  useEffect(() => {
    if (state !== "running" || !user) return;
    const id = setInterval(() => updateSession(user.id), 30_000);
    return () => clearInterval(id);
  }, [state, user]);

  // 운동 시작/재개 시 resumeAt 저장, 정지/완료 시 제거
  useEffect(() => {
    if (state === "running") {
      localStorage.setItem(WK_KEY.resumeAt, String(Date.now()));
      localStorage.setItem(WK_KEY.activityType, selectedActivityType?.type ?? "walker");
    } else {
      localStorage.removeItem(WK_KEY.resumeAt);
    }
  }, [state, selectedActivityType]);

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
      setSteps((prev) => {
        const next = prev + 1;
        stepsRef.current = next;
        // resumeAt/steps 갱신 (백그라운드 복구 기준점)
        localStorage.setItem(WK_KEY.resumeAt, String(Date.now()));
        localStorage.setItem(WK_KEY.steps, String(next));
        return next;
      });
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
    { label: "시간", value: formatTime(elapsed), unit: "시간", icon: "⏱️" },
    { label: "걸음수", value: steps.toLocaleString(), unit: "보", icon: "👟" },
    { label: "거리", value: distance.toFixed(2), unit: "km", icon: "📍" },
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
              {selectedActivityType.emoji} {selectedActivityType.name} ·{" "}
              {kcalPerMin}
              kcal/분
            </span>
          )}
        </div>
        <button
          onClick={() => setShowBuddies((v) => !v)}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition"
          aria-label={showBuddies ? "친구 숨기기" : "친구 보이기"}
        >
          <FaUsers
            className="text-base"
            style={{ color: showBuddies ? "var(--color-primary)" : "#9ca3af" }}
          />
        </button>
      </div>

      {/* 목표 뱃지 */}
      <div className="flex flex-col items-center  mt-1 mb-0">
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
        {/* 오늘 누적 */}
        <p className="text-[11px] text-gray-400 mt-1 font-semibold">
          {todayTotalText}
        </p>
      </div>

      {/* 상태 텍스트 */}
      <p
        className="text-center text-sm font-semibold mt-1 mb-0"
        style={{ color: "var(--color-primary)" }}
      >
        {state === "idle" && "시작 버튼을 눌러보세요!"}
        {state === "running" && "🔥 운동 중이에요!"}
        {state === "paused" && (
          <span className="inline-flex items-center justify-center gap-1">
            <FaPause /> 일시정지됨
          </span>
        )}
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
              {characterImage ? (
                <img
                  src={characterImage}
                  alt=""
                  className="w-full h-full object-contain rounded-full"
                />
              ) : (
                <span>{characterEmoji}</span>
              )}
            </div>
          )}

          {/* 친구 아바타 - 캐릭터 중심 공전 */}
          <style>{`
            @keyframes orbit-rotate {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            @keyframes counter-rotate {
              from { transform: rotate(0deg); }
              to   { transform: rotate(-360deg); }
            }
          `}</style>
          {showBuddies && (
            <div
              className="absolute pointer-events-none"
              style={{ left: CX, top: CY }}
            >
              {buddies.map((buddy, i) => {
                const duration = 120;

                const delay = -(duration / buddies.length) * i;
                return (
                  <div
                    key={buddy.nickname}
                    className="absolute z-10"
                    style={{
                      left: 0,

                      top: 0,

                      transformOrigin: "0 0",

                      animation: `orbit-rotate ${duration}s linear infinite`,

                      animationDelay: `${delay}s`,
                    }}
                    title={`${buddy.nickname}님 ${buddy.activity}`}
                  >
                    <div
                      className="absolute flex flex-col items-center"
                      style={{
                        left: 112,

                        top: -18,

                        width: 36,

                        height: 36,

                        transformOrigin: "18px 18px",

                        animation: `counter-rotate ${duration}s linear infinite`,

                        animationDelay: `${delay}s`,
                      }}
                    >
                      {/* 말풍선 - 아바타 위에 따라다님 */}
                      <div
                        className="absolute bg-white shadow-sm rounded-full px-2 py-0.5 flex items-center gap-1 whitespace-nowrap"
                        style={{
                          bottom: "calc(100% + 4px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                        <span className="text-[8px] font-bold text-gray-600">
                          {buddy.nickname}{" "}
                          {ACTIVITY_LABEL[buddy.activity] ?? "운동 중"}
                        </span>
                      </div>
                      {/* 아바타 */}
                      <div className="w-9 h-9 rounded-full bg-white shadow-md border-2 border-white overflow-hidden">
                        <img
                          src={buddy.character_image}
                          alt={buddy.nickname}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
            >
              운동 시작
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
            <>
              <button
                onClick={() => {
                  setSteps(0);
                  setElapsed(0);
                  isSaved.current = false;
                  setTooShort(false);
                  setState("idle");
                  clearWorkoutSession();
                }}
                className="flex-1 py-4 rounded-2xl bg-gray-100 font-extrabold text-gray-600 active:scale-95 transition"
              >
                다시 도전하기
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 py-4 rounded-2xl text-white font-extrabold shadow-md active:scale-95 transition"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                🎉 결과 보기
              </button>
            </>
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
                {tooShort ? "😅" : goalProgress >= 100 ? "🎉" : "💪"}
              </span>
              <p className="text-white font-extrabold text-2xl mt-1">
                {tooShort ? "잠깐!" : "운동 완료!"}
              </p>
              <p className="text-white/70 text-sm">
                {tooShort
                  ? "기록이 저장되지 않았어요"
                  : goalProgress >= 100
                    ? "목표 달성! 정말 잘 했어요 🏆"
                    : "오늘도 정말 잘 했어요"}
              </p>
            </div>

            {tooShort ? (
              <div className="px-6 py-10 flex flex-col items-center gap-3">
                <p className="font-extrabold text-gray-800 text-base text-center">
                  너무 짧은 운동이에요 😅
                </p>
                <p className="text-sm text-gray-400 text-center leading-relaxed">
                  30초 이상, 50보 이상 운동해야 기록돼요
                </p>
              </div>
            ) : (
              <>
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
                    { icon: "⏱️", label: "운동 시간", value: durationLabel },

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
                          {selectedActivityType!.emoji}{" "}
                          {selectedActivityType!.name} 맞춤 식단
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
              </>
            )}

            <div className="px-6 py-4">
              {tooShort ? (
                <button
                  onClick={() => {
                    setSteps(0);
                    setElapsed(0);
                    isSaved.current = false;
                    setTooShort(false);
                    setShowModal(false);
                    setState("idle");
                    clearWorkoutSession();
                  }}
                  className="w-full py-4 rounded-2xl font-extrabold text-white text-base active:scale-95 transition"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                  }}
                >
                  다시 운동하기
                </button>
              ) : (
                <button
                  onClick={() => {
                    clearWorkoutSession();
                    navigate("/community");
                  }}
                  className="w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                  }}
                >
                  📝 운동 인증하러가기
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
