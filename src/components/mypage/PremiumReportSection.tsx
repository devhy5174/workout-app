import React, { useState } from "react";
import { HiMap, HiInformationCircle, HiLockClosed } from "react-icons/hi";
import MbtiInfoModal from "../ui/MbtiInfoModal";
import PremiumModal from "../ui/PremiumModal";
import { HiMapPin, HiFire, HiArrowTrendingUp, HiClock } from "react-icons/hi2";

const CARD_ICONS: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  distance: { icon: HiMapPin, color: "text-blue-500", bg: "bg-blue-50" },
  calories: { icon: HiFire, color: "text-orange-500", bg: "bg-orange-50" },
  steps: {
    icon: HiArrowTrendingUp,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  duration: { icon: HiClock, color: "text-purple-500", bg: "bg-purple-50" },
};

import {
  generateMonthlyCards,
  calculateWorkoutMBTI,
  type DrillStyle,
} from "../../utils/premiumMonthlyReportUtils";

import { WORKOUT_MBTI_DICTIONARY } from "../../data/premiumReportData";
import type { WorkoutRecord } from "../../lib/workoutService";

interface PremiumSectionProps {
  isPremium: boolean;
  onUpgrade: () => void;
  workouts: WorkoutRecord[];
}

const PremiumReportSection: React.FC<PremiumSectionProps> = ({
  isPremium,
  workouts,
}) => {
  const [drillStyle, setDrillStyle] = useState<DrillStyle>(
    () => (localStorage.getItem("drill_style") as DrillStyle) ?? "adult",
  );

  function changeDrillStyle(style: DrillStyle) {
    setDrillStyle(style);
    localStorage.setItem("drill_style", style);
  }
  const [showMbtiInfo, setShowMbtiInfo] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // 월간 합산
  const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  const totalSteps = workouts.reduce((sum, w) => sum + w.steps, 0);
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);

  const averageSpeed = totalDistance / Math.max(totalDuration / 3600, 1);

  const uniqueWorkoutDays = new Set(
    workouts.map(
      (w) => new Date(w.created_at ?? w.date).toISOString().split("T")[0],
    ),
  );
  const workoutDays = uniqueWorkoutDays.size;

  let weekendWorkoutCount = 0;
  let weekdayWorkoutCount = 0;
  let morningWorkoutCount = 0;
  let nightWorkoutCount = 0;

  workouts.forEach((workout) => {
    const date = new Date(workout.created_at ?? workout.date);
    const day = date.getDay();
    const hour = date.getHours();

    if (day === 5 || day === 6 || day === 0) {
      weekendWorkoutCount++;
    } else {
      weekdayWorkoutCount++;
    }
    if (hour >= 6 && hour <= 10) morningWorkoutCount++;
    if (hour >= 19 && hour <= 23) nightWorkoutCount++;
  });

  const typeCounts: Record<string, number> = {};
  workouts.forEach((w) => {
    if (w.workout_type)
      typeCounts[w.workout_type] = (typeCounts[w.workout_type] ?? 0) + 1;
  });
  const dominantWorkoutType = Object.entries(typeCounts).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  const mbtiCode = calculateWorkoutMBTI({
    workoutDays,
    weekendWorkoutCount,
    weekdayWorkoutCount,
    averageSpeed,
    totalDistance,
    totalCalories,
    morningWorkoutCount,
    nightWorkoutCount,
    dominantWorkoutType,
  });

  const badgeEntry =
    WORKOUT_MBTI_DICTIONARY[mbtiCode as keyof typeof WORKOUT_MBTI_DICTIONARY];
  const badge = badgeEntry?.[drillStyle];

  const cards = generateMonthlyCards(
    { totalDistance, totalCalories, totalSteps, totalDuration },
    drillStyle,
  );

  return (
    <>
      <div className="mt-10 mb-20 px-4">
        {/* 타이틀 + 드립 스타일 토글 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <h2 className="text-lg font-extrabold text-gray-800">
              이달의 운동 리포트
            </h2>
          </div>
          {isPremium ? (
            <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => changeDrillStyle("mz")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${drillStyle === "mz" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"}`}
              >
                🔥 매운맛
              </button>
              <button
                onClick={() => changeDrillStyle("adult")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${drillStyle === "adult" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"}`}
              >
                ☕ 순한맛
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPremiumModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              <HiLockClosed className="text-[10px]" />
              프리미엄 기록 분석
            </button>
          )}
        </div>

        {isPremium ? (
          <div className="space-y-4">
            {/* 유산소 MBTI — 컴팩트 뱃지 */}
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📊</span>
                  <span className="text-xs font-bold text-gray-400">
                    유산소 MBTI
                  </span>
                  <span className="font-black text-gray-800 text-sm">
                    {mbtiCode}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">
                    · {badge?.title} {badge?.emoji}
                  </span>
                </div>
                <button
                  onClick={() => setShowMbtiInfo(true)}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                  aria-label="유산소 MBTI 안내"
                >
                  <HiInformationCircle className="text-base" />
                </button>
              </div>
              {badge?.description && (
                <p
                  className="mt-2 text-xs text-gray-500 leading-relaxed pl-1 underline underline-offset-[3px] decoration-2"
                  style={{ textDecorationColor: "var(--color-primary)" }}
                >
                  ✓ {badge.description}
                </p>
              )}
            </div>

            {/* 리포트 카드 */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-primary font-bold mb-5">
                <HiMap />
                <span>이달의 운동 분석</span>
              </div>
              <div className="flex flex-col gap-3">
                {cards.map((card) => (
                  <div
                    key={card.type}
                    className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${CARD_ICONS[card.type]?.bg ?? "bg-gray-50"}`}
                    >
                      {React.createElement(
                        CARD_ICONS[card.type]?.icon ?? HiMap,
                        {
                          className: `text-xl ${CARD_ICONS[card.type]?.color ?? "text-gray-400"}`,
                        },
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">
                        {card.title}
                      </p>
                      <p className="text-base font-black text-gray-900 mb-0.5">
                        {card.value}
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 비프리미엄 — 미리보기 카드 */
          <div className="space-y-3">
            {/* MBTI 미리보기 */}
            {/* 유산소 MBTI — 컴팩트 뱃지 */}
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">📊</span>
                <span className="text-xs font-bold text-gray-400">
                  유산소 MBTI
                </span>
              </div>
              <button
                onClick={() => setShowMbtiInfo(true)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
                aria-label="유산소 MBTI 안내"
              >
                <HiInformationCircle className="text-base" />
              </button>
            </div>
            {/* 리포트 미리보기 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <HiMap className="text-gray-300" />
                <span className="text-sm font-bold text-gray-400">
                  이달의 운동 분석
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  {
                    icon: HiMapPin,
                    label: "이달 이동 거리",
                    color: "text-blue-300",
                    bg: "bg-blue-50",
                  },
                  {
                    icon: HiFire,
                    label: "이달 칼로리",
                    color: "text-orange-300",
                    bg: "bg-orange-50",
                  },
                  {
                    icon: HiArrowTrendingUp,
                    label: "이달 걸음 수",
                    color: "text-green-300",
                    bg: "bg-green-50",
                  },
                  {
                    icon: HiClock,
                    label: "이달 운동 시간",
                    color: "text-purple-300",
                    bg: "bg-purple-50",
                  },
                ].map(({ icon: Icon, label, color, bg }) => (
                  <div
                    key={label}
                    className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${bg}`}
                    >
                      <Icon className={`text-xl ${color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 font-medium mb-1.5">
                        {label}
                      </p>
                      <div className="h-2 bg-gray-200 rounded-full w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showMbtiInfo && <MbtiInfoModal onClose={() => setShowMbtiInfo(false)} />}
      {showPremiumModal && (
        <PremiumModal
          onClose={() => setShowPremiumModal(false)}
          title="프리미엄 기록 분석"
          description="실제로 기록된 데이터로 재밌는 월간리포트와 나의 숨겨진 유산소 MBTI를 확인할 수 있습니다."
        />
      )}
    </>
  );
};

export default PremiumReportSection;
