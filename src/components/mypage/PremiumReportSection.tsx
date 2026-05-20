import React, { useState } from "react";
import { HiLockClosed, HiMap, HiInformationCircle, HiX } from "react-icons/hi";
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
  onUpgrade,
  workouts,
}) => {
  const [drillStyle, setDrillStyle] = useState<DrillStyle>("adult");
  const [showMbtiInfo, setShowMbtiInfo] = useState(false);

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

  const mbtiCode = calculateWorkoutMBTI({
    workoutDays,
    weekendWorkoutCount,
    weekdayWorkoutCount,
    averageSpeed,
    totalDistance,
    totalCalories,
    morningWorkoutCount,
    nightWorkoutCount,
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
              월간 리포트 & 유산소 MBTI
            </h2>
          </div>
        </div>

        <div className="relative">
          {/* 프리미엄 blur */}

          <div
            className={`space-y-4 transition-all duration-500 ${
              !isPremium ? "blur-md pointer-events-none select-none" : ""
            }`}
          >
            {/* 유산소 mbti */}
            <div>
              {/* 섹션 제목 */}
              <div className="flex items-center gap-1.5 mb-3 px-1">
                <span className="text-base font-extrabold text-gray-800">
                  📊 유산소 MBTI
                </span>
                <button
                  onClick={() => setShowMbtiInfo(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="유산소 MBTI 안내"
                >
                  <HiInformationCircle className="text-lg" />
                </button>
              </div>

              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white">
                <div className="flex items-start mb-6">
                  <div>
                    <p className="text-indigo-100 text-xs font-bold mb-1">
                      MONTHLY STYLE
                    </p>
                    <h3 className="text-2xl font-black">
                      {mbtiCode} {badge?.emoji}
                    </h3>
                    <p className="text-sm text-indigo-100 mt-1">
                      {badge?.title}{" "}
                    </p>
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <p className="text-sm leading-relaxed text-indigo-50">
                    {badge?.description}
                  </p>
                </div>
              </div>
            </div>
            {/* 리포트 카드 */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <HiMap />
                  <span>이달의 운동 분석</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setDrillStyle("mz")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      drillStyle === "mz"
                        ? "bg-white text-gray-800 shadow-sm"
                        : "text-gray-400"
                    }`}
                  >
                    🔥 매운맛
                  </button>
                  <button
                    onClick={() => setDrillStyle("adult")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      drillStyle === "adult"
                        ? "bg-white text-gray-800 shadow-sm"
                        : "text-gray-400"
                    }`}
                  >
                    ☕ 순한맛
                  </button>
                </div>
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

          {/* 무료 유저 blur overlay */}
          {!isPremium && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/10 px-6 text-center">
              <div className="bg-white p-4 rounded-full shadow-xl mb-4">
                <HiLockClosed className="text-3xl text-amber-500" />
              </div>
              <p className="text-lg font-black text-gray-800 mb-2">
                나의 운동 스타일이 궁금하신가요?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                프리미엄 구독 시,
                <br />
                재밌는 월간리포트와 나의 숨겨진 유산소 MBTI를 <br />
                확인할 수 있습니다 👀
              </p>
              <button
                onClick={onUpgrade}
                className="w-full max-w-[280px] bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg"
              >
                👑 프리미엄 구독하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 유산소 MBTI 안내 모달 */}
      {showMbtiInfo && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6"
          onClick={() => setShowMbtiInfo(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-gray-800">
                📊 유산소 MBTI란?
              </h3>
              <button
                onClick={() => setShowMbtiInfo(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="닫기"
              >
                <HiX className="text-xl" />
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              유저님의 한 달 운동 데이터를 분석하여{" "}
              <span className="font-bold text-gray-800">
                [빈도(E/W) · 속도(R/W) · 목적(F/D) · 시간(M/N)]
              </span>
              의 앞 글자를 조합해 만든 유니크한 운동 성향 지표입니다!
            </p>

            <div className="space-y-2">
              {[
                {
                  code: "E / W",
                  desc: "꾸준 운동형(Everyday) vs 주말 몰빵형(Weekend)",
                },
                { code: "R / W", desc: "러너형(Runner) vs 산책형(Walker)" },
                {
                  code: "F / D",
                  desc: "칼로리 소각형(Fatburn) vs 거리 정복형(Distance)",
                },
                { code: "M / N", desc: "아침형(Morning) vs 야행성형(Night)" },
              ].map(({ code, desc }) => (
                <div
                  key={code}
                  className="flex items-start gap-3 bg-gray-50 rounded-2xl px-4 py-3"
                >
                  <span className="font-black text-indigo-500 text-sm w-14 shrink-0">
                    {code}
                  </span>
                  <span className="text-sm text-gray-600">{desc}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowMbtiInfo(false)}
              className="mt-5 w-full bg-gray-900 text-white py-3.5 rounded-2xl font-bold text-sm"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PremiumReportSection;
