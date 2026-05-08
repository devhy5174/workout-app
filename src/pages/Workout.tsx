import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacter } from "../context/CharacterContext";
import { storage } from "../utils/storage";
import { POINT_RULES } from "../data/points";
import { calculateStreak, isWeekend } from "../utils/streak";

// ── 캐릭터별 추천 식단 (더미) ───────────────────
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
      { emoji: "🥢", name: "두부" },
      { emoji: "🥦", name: "채소" },
    ],
    tip: "소화가 편한 식물성 단백질을 추천해요.",
  },
  4: {
    meals: [
      { emoji: "🍗", name: "닭가슴살" },
      { emoji: "🍠", name: "고구마" },
    ],
    tip: "운동 직후 30분 이내 단백질을 섭취하세요.",
  },
  5: {
    meals: [
      { emoji: "🍌", name: "바나나" },
      { emoji: "🫙", name: "그릭요거트" },
    ],
    tip: "전해질 보충과 단백질 회복에 딱이에요.",
  },
  6: {
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

// ── Ring constants ──────────────────────────────
const GOAL_STEPS = 5000;
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
  const { selectedCharacter } = useCharacter();
  const [state, setState] = useState<WorkoutState>("idle");
  const [steps, setSteps] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const characterEmoji = selectedCharacter?.emoji ?? "🏃";
  const progress = Math.min((steps / GOAL_STEPS) * 100, 100);
  const dashOffset = CIRCUMFERENCE * (1 - progress / 100);
  const distance = (steps * 0.0008).toFixed(2);
  // TODO: 유저 프로필(키/몸무게) 연동 시 맞춤 칼로리 계산으로 교체
  const calories = Math.floor(steps * 0.05);
  const pointsEarned = Math.max(Math.floor(parseFloat(distance) * POINT_RULES.PER_KM), 1);
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;
  const durationLabel =
    elapsedMin > 0 ? `${elapsedMin}분 ${elapsedSec}초` : `${elapsedSec}초`;

  const charDiet = selectedCharacter
    ? DIET_BY_CHARACTER[selectedCharacter.id]
    : null;
  const durationDiet =
    elapsedMin >= 30 ? DIET_BY_DURATION.protein : DIET_BY_DURATION.light;

  const handleStop = () => {
    const currentCalories = calories;
    const currentElapsed = elapsed;
    setState("paused");

    const prevKcal = storage.getBurnedKcal() ?? 0;
    storage.setBurnedKcal(prevKcal + currentCalories);
    storage.addWorkoutToday();

    // 식단 저장
    storage.setRecommendedDiet({
      durationLabel:
        Math.floor(currentElapsed / 60) >= 30
          ? "⏱ 30분 이상 운동 — 단백질 보충 필요!"
          : "⏱ 30분 미만 운동 — 가벼운 식단 추천",
      durationMeals: durationDiet.meals,
      characterEmoji: selectedCharacter?.emoji,
      characterName: selectedCharacter?.name,
      characterMeals: charDiet?.meals,
      tip: charDiet?.tip,
    });

    // ── 포인트 계산 ──────────────────────────────
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const todayStr = `${today.getFullYear()}.${pad(today.getMonth() + 1)}.${pad(today.getDate())}`;

    // 오늘 이미 받은 보너스 목록 (중복 방지)
    const todayHistory = storage.getPointsHistory().filter(e => e.date === todayStr);
    const hasBonus = (icon: string) => todayHistory.some(e => e.icon === icon);

    let earned = 0;

    // km당 포인트 (매 운동마다 적립)
    storage.addPoints(pointsEarned);
    storage.addPointsHistory({ date: todayStr, desc: `${distance}km 운동 완료`, points: pointsEarned, icon: "🏃" });
    earned += pointsEarned;

    // 목표 달성 보너스 (오늘 첫 달성 시)
    if (steps >= GOAL_STEPS && !hasBonus("🎯")) {
      storage.addPoints(POINT_RULES.GOAL_BONUS);
      storage.addPointsHistory({ date: todayStr, desc: "걸음 수 목표 달성", points: POINT_RULES.GOAL_BONUS, icon: "🎯" });
      earned += POINT_RULES.GOAL_BONUS;
    }

    // 7일 연속 보너스 (오늘 첫 수령 시)
    const freshHistory = storage.getWorkoutHistory();
    const currentStreak = calculateStreak(freshHistory);
    if (currentStreak > 0 && currentStreak % 7 === 0 && !hasBonus("🔥")) {
      storage.addPoints(POINT_RULES.STREAK_7_BONUS);
      storage.addPointsHistory({ date: todayStr, desc: `${currentStreak}일 연속 운동 보너스`, points: POINT_RULES.STREAK_7_BONUS, icon: "🔥" });
      earned += POINT_RULES.STREAK_7_BONUS;
    }

    // 주말 보너스 (오늘 첫 수령 시)
    if (isWeekend(today) && !hasBonus("⭐")) {
      storage.addPoints(POINT_RULES.WEEKEND_BONUS);
      storage.addPointsHistory({ date: todayStr, desc: "주말 운동 보너스", points: POINT_RULES.WEEKEND_BONUS, icon: "⭐" });
      earned += POINT_RULES.WEEKEND_BONUS;
    }

    setEarnedPoints(earned);
    setShowModal(true);
  };

  // 링 위 캐릭터 위치 계산 (12시 방향에서 시작)
  const angle = (progress / 100) * 2 * Math.PI - Math.PI / 2;
  const emojiX = CX + RADIUS * Math.cos(angle);
  const emojiY = CY + RADIUS * Math.sin(angle);

  // 걸음 수 증가 (100ms마다, 데모용 가속)
  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => {
      setSteps((prev) => {
        const next = prev + Math.floor(Math.random() * 8 + 7);
        if (next >= GOAL_STEPS) {
          setState("done");
          return GOAL_STEPS;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [state]);

  // 타이머 (1초마다)
  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  const stats = [
    { label: "거리", value: distance, unit: "km", icon: "📍" },
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
        <h1 className="font-extrabold text-gray-800">운동 트래킹</h1>
        <div className="w-10" />
      </div>

      {/* 상태 텍스트 */}
      <p
        className="text-center text-sm font-semibold mt-1 mb-0"
        style={{ color: "var(--color-primary)" }}
      >
        {state === "idle" && "시작 버튼을 눌러보세요!"}
        {state === "running" && "🔥 운동 중이에요!"}
        {state === "paused" && "⏸ 일시정지됨"}
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
              {/* 발광 효과 */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 배경 트랙 */}
            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={STROKE_W}
            />

            {/* 진행 아크 */}
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

          {/* 링 위 캐릭터 이모지 */}
          {state !== "idle" && (
            <div
              className="absolute w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-xl z-10"
              style={{
                left: emojiX - 20,
                top: emojiY - 20,
                transition: "left 0.12s ease, top 0.12s ease",
              }}
            >
              {characterEmoji}
            </div>
          )}

          {/* 링 중앙 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            {state === "idle" && (
              <button
                onClick={() => setState("running")}
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                <span className="text-white text-3xl">▶</span>
                <span className="text-white font-extrabold text-xs mt-0.5">
                  시작
                </span>
              </button>
            )}
            {(state === "running" || state === "paused") && (
              <>
                <p className="text-5xl font-extrabold text-gray-800 leading-none">
                  {Math.floor(progress)}
                  <span className="text-2xl text-gray-400">%</span>
                </p>
                <p className="text-xs text-gray-400 mt-1 font-semibold">
                  목표 달성
                </p>
                <p
                  className="text-xs font-bold mt-2"
                  style={{ color: "var(--color-primary)" }}
                >
                  {(GOAL_STEPS - steps).toLocaleString()}보 남음
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
              onClick={() => setState("running")}
              className="flex-1 py-4 rounded-2xl text-white font-extrabold shadow-md active:scale-95 transition"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              🏃 운동 시작
            </button>
          )}
          {state === "running" && (
            <>
              <button
                onClick={() => setState("paused")}
                className="flex-1 py-4 rounded-2xl bg-white shadow-sm font-extrabold text-gray-600 border border-gray-100 active:scale-95 transition"
              >
                ⏸ 일시정지
              </button>
              <button
                onClick={handleStop}
                className="flex-1 py-4 rounded-2xl bg-gray-100 font-extrabold text-gray-500 active:scale-95 transition"
              >
                ⏹ 종료
              </button>
            </>
          )}
          {state === "paused" && (
            <>
              <button
                onClick={() => setState("running")}
                className="flex-1 py-4 rounded-2xl text-white font-extrabold shadow-md active:scale-95 transition"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                ▶ 재개
              </button>
              <button
                onClick={handleStop}
                className="flex-1 py-4 rounded-2xl bg-gray-100 font-extrabold text-gray-500 active:scale-95 transition"
              >
                ⏹ 종료
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
      {/* 완료 팝업 */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* 상단 그라디언트 헤더 */}
            <div
              className="flex flex-col items-center py-8 gap-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              <span className="text-5xl">🎉</span>
              <p className="text-white font-extrabold text-2xl mt-1">
                운동 완료!
              </p>
              <p className="text-white/70 text-sm">오늘도 정말 잘 했어요 💪</p>
            </div>

            {/* 스탯 목록 */}
            <div className="px-6 py-5 flex flex-col gap-3">
              {[
                { icon: "📍", label: "거리", value: `${distance} km` },
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

              {/* 획득 포인트 */}
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

            {/* 추천 식단 섹션 */}
            {
              <div className="px-6 pb-2">
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "var(--color-bg, #f9fafb)" }}
                >
                  <p className="font-extrabold text-gray-800 text-sm mb-3">
                    오늘 추천 식단 🥗
                  </p>

                  {/* 운동 시간 기준 */}
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

                  {/* 캐릭터 기준 */}
                  {charDiet && (
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold mb-1.5">
                        {selectedCharacter!.emoji} {selectedCharacter!.name}{" "}
                        맞춤 식단
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
            }

            {/* 홈으로 가기 버튼 */}
            <div className="px-6 py-4">
              <button
                onClick={() => navigate("/")}
                className="w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                🏠 홈으로 가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
