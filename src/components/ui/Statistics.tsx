import React from "react";
import {
  HiLockClosed,
  HiShare,
  HiBadgeCheck,
  HiMap,
  HiFire,
} from "react-icons/hi";

// 1. 센스 넘치는 프리미엄 모의 데이터 (Mock Data)
const premiumMonthlyReportMock = {
  summary: { month: 5, userGrade: "VIP 버닝 마스터" },
  distance: {
    value: 142,
    description:
      "서울에서 대전까지(140km) 하이패스 없이 맨발로 완주한 거리와 같아요! 🗺️",
  },
  calories: {
    totalBurn: 15400,
    foodMatches: [
      {
        name: "황금올리브 치킨",
        count: 7,
        icon: "🍗",
        text: "치킨 7마리를 무(Zero)로 환원!",
      },
      {
        name: "왕가 탕후루",
        count: 77,
        icon: "🍡",
        text: "당 충전 77번의 죄책감 소멸!",
      },
    ],
  },
  badge: {
    id: "earlyBird",
    title: "얼리버드 프로 산책러 🌅",
    subTitle: "새벽 공기 수집가",
    description:
      "남들 잠들어 있을 때 이미 오늘 목표 칼로리 절반을 태우셨군요? 이 구역의 아침 유산소 대장은 유저님입니다. 이 부지런함이면 스타트업 창업해서 유니콘 기업 만드셔도 되겠어요! 🦄",
  },
};

interface PremiumSectionProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

const PremiumReportSection: React.FC<PremiumSectionProps> = ({
  isPremium,
  onUpgrade,
}) => {
  return (
    <div className="mt-10 mb-20 px-4">
      {/* 타이틀 섹션 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">👑</span>
        <h2 className="text-lg font-extrabold text-gray-800">
          프리미엄 월간 리포트 & 분석
        </h2>
      </div>

      <div className="relative">
        {/* [3] 프리미엄 등급별 조건부 렌더링 (isPremium이 false면 블러 처리) */}
        <div
          className={`space-y-4 transition-all duration-500 ${!isPremium ? "blur-md pointer-events-none select-none" : ""}`}
        >
          {/* [1] 📅 이달의 유산소 가성비 리포트 카드 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-primary font-bold">
              <HiMap /> <span>가성비 거리 분석</span>
            </div>
            <p className="text-2xl font-black text-gray-900 mb-2">
              {premiumMonthlyReportMock.distance.value}km 돌파!
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              {premiumMonthlyReportMock.distance.description}
            </p>

            <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold">
                <HiFire /> <span>칼로리 음식 환산</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {premiumMonthlyReportMock.calories.foodMatches.map(
                  (food, idx) => (
                    <div
                      key={idx}
                      className="bg-orange-50 p-3 rounded-2xl text-center"
                    >
                      <span className="text-2xl mb-1 block">{food.icon}</span>
                      <p className="text-xs font-bold text-orange-800">
                        {food.name}
                      </p>
                      <p className="text-sm font-black text-orange-600">
                        {food.count}개 삭제
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* [2] 🏆 이달의 유산소 스타일 분석 뱃지 카드 */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-indigo-100 text-xs font-bold mb-1">
                  MAY STYLE BADGE
                </p>
                <h3 className="text-xl font-black">
                  {premiumMonthlyReportMock.badge.title}
                </h3>
              </div>
              <div className="bg-white/20 p-2 rounded-xl text-2xl">🏆</div>
            </div>

            <div className="flex justify-center my-8">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl animate-pulse">
                <span className="text-6xl">🌅</span>
              </div>
            </div>

            <p className="text-sm text-indigo-50 leading-relaxed mb-6 text-center italic">
              "{premiumMonthlyReportMock.badge.description}"
            </p>

            <div className="flex gap-2">
              <button className="flex-1 bg-white text-indigo-600 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                <HiBadgeCheck /> 대표 뱃지 장착
              </button>
              <button className="flex-1 bg-indigo-700 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                <HiShare /> 인스타 자랑
              </button>
            </div>
          </div>
        </div>

        {/* [3-2] 무료 유저용 자물쇠 오버레이 */}
        {!isPremium && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/10 px-6 text-center">
            <div className="bg-white p-4 rounded-full shadow-xl mb-4">
              <HiLockClosed className="text-3xl text-amber-500" />
            </div>
            <p className="text-lg font-black text-gray-800 mb-2">
              나의 유산소 스타일이 궁금하신가요?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              프리미엄 구독 시, 치킨 환산 리포트와
              <br />
              이달의 분석 뱃지가 즉시 해금됩니다!
            </p>
            <button
              onClick={onUpgrade}
              className="w-full max-w-[280px] bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform"
            >
              👑 프리미엄 구독하고 해금하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumReportSection;
