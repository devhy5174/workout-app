import { useState } from "react";
import type { IconType } from "react-icons";
import { HiLockClosed } from "react-icons/hi";
import {
  HiStar,
  HiChatBubbleOvalLeft,
  HiPhoto,
  HiSparkles,
  HiCalendar,
  HiSun,
  HiMoon,
  HiCloud,
  HiCheckCircle,
  HiNoSymbol,
} from "react-icons/hi2";
import { useUser } from "../context/UserContext";
import { useUnlockItems } from "../hooks/useUnlockItems";
import type { UnlockItemType } from "../data/unlockItems";

type Tab = "step" | "premium" | "season";
type PlanType = "monthly" | "annual";

interface TypeMeta {
  label: string;
  Icon: IconType;
  iconColor: string;
  bgColor: string;
}

const TYPE_META: Record<UnlockItemType, TypeMeta> = {
  title: {
    label: "칭호",
    Icon: HiStar,
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
  activeBubble: {
    label: "파티 말풍선",
    Icon: HiChatBubbleOvalLeft,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-50",
  },
  postFrame: {
    label: "인증카드 프레임",
    Icon: HiPhoto,
    iconColor: "text-green-500",
    bgColor: "bg-green-50",
  },
  premium: {
    label: "혜택",
    Icon: HiSparkles,
    iconColor: "text-violet-500",
    bgColor: "bg-violet-50",
  },
};

const NORMAL_TYPE_ORDER: UnlockItemType[] = [
  "title",
  "activeBubble",
  "postFrame",
];

const SEASON_PREVIEWS: {
  Icon: IconType;
  color: string;
  bg: string;
  name: string;
  desc: string;
}[] = [
  {
    Icon: HiSun,
    color: "text-pink-400",
    bg: "bg-pink-50",
    name: "벚꽃 산책러",
    desc: "봄 시즌 한정 칭호",
  },
  {
    Icon: HiCloud,
    color: "text-sky-400",
    bg: "bg-sky-50",
    name: "여름 러너",
    desc: "여름 시즌 한정 칭호",
  },
  {
    Icon: HiMoon,
    color: "text-orange-400",
    bg: "bg-orange-50",
    name: "가을 걷기왕",
    desc: "가을 시즌 한정 칭호",
  },
];

export default function Step() {
  const [tab, setTab] = useState<Tab>("step");
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("annual");
  const { workoutRecords } = useUser();
  const { itemsWithStatus, totalSteps, monthlyAverageSteps } =
    useUnlockItems(workoutRecords);

  const normalItems = itemsWithStatus.filter((i) => i.category === "normal");

  const tabs: { key: Tab; label: string }[] = [
    { key: "step", label: "STEP 보상" },
    { key: "premium", label: "프리미엄" },
    { key: "season", label: "시즌" },
  ];

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* 상단 카드 */}
      <div className="mx-4 mt-5 rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 shadow-lg">
        <p className="text-white/70 text-sm font-semibold">총 누적 걸음수</p>
        <p className="text-white text-5xl font-extrabold mt-1 tracking-tight">
          {totalSteps.toLocaleString()}
          <span className="text-xl ml-2 font-bold opacity-80">STEPS</span>
        </p>
        <p className="text-white/70 text-xs mt-3">
          월 평균{" "}
          <span className="text-white font-bold">
            {monthlyAverageSteps.toLocaleString()}
          </span>
          보 · 걸음수 달성 시 보상이 해금돼요
        </p>
      </div>

      {/* 탭 */}
      <div className="mx-4 mt-4 flex bg-white rounded-2xl shadow-sm p-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === key ? "bg-primary text-white shadow-sm" : "text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-24 flex flex-col gap-5">
        {/* ── STEP 보상 ── */}
        {tab === "step" &&
          NORMAL_TYPE_ORDER.map((type) => {
            const group = normalItems.filter((i) => i.type === type);
            if (group.length === 0) return null;
            const meta = TYPE_META[type];
            return (
              <div key={type}>
                <p className="text-xs font-bold text-gray-500 px-1 mb-2 flex items-center gap-1">
                  <meta.Icon className={`text-sm ${meta.iconColor}`} />
                  {meta.label}
                </p>
                <div className="flex flex-col gap-2">
                  {group.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 transition-all ${
                        item.unlocked ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          item.unlocked ? meta.bgColor : "bg-gray-100"
                        }`}
                      >
                        {item.unlocked ? (
                          <meta.Icon className={`text-xl ${meta.iconColor}`} />
                        ) : (
                          <HiLockClosed className="text-xl text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-sm ${item.unlocked ? "text-gray-800" : "text-gray-400"}`}
                        >
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.condition?.monthlyAverageStep
                            ? `월 평균 ${item.condition.monthlyAverageStep.toLocaleString()}보 필요`
                            : item.description}
                        </p>
                      </div>
                      {item.unlocked ? (
                        <span className="flex-shrink-0 bg-green-100 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full">
                          해금됨
                        </span>
                      ) : (
                        <span className="flex-shrink-0 text-xs text-gray-400 font-bold">
                          {item.condition?.monthlyAverageStep?.toLocaleString()}
                          보
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

        {/* ── 프리미엄 ── */}
        {tab === "premium" && (
          <>
            {/* 히어로 카드 */}
            <div className="rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <HiSparkles className="text-xl text-white/80" />
                <p className="text-white font-extrabold text-base tracking-wide">
                  PREMIUM MEMBER
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { Icon: HiChatBubbleOvalLeft, text: "활동중 특별 말풍선" },
                  { Icon: HiNoSymbol, text: "광고 없는 경험" },
                  { Icon: HiPhoto, text: "전용 카드 테마" },
                  { Icon: HiStar, text: "프리미엄 칭호" },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon className="text-white/70 text-base flex-shrink-0" />
                    <p className="text-white/90 text-sm font-medium">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 요금 선택 */}
            <p className="text-xs font-bold text-gray-500 px-1">요금 선택</p>

            {/* 월간 카드 */}
            <div
              onClick={() => setSelectedPlan("monthly")}
              className={`cursor-pointer bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4 border-2 transition-all ${
                selectedPlan === "monthly"
                  ? "border-primary"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">월간</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">
                    ₩4,900
                    <span className="text-base font-semibold text-gray-400 ml-1">
                      / 월
                    </span>
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-1 flex-shrink-0 transition-all ${
                    selectedPlan === "monthly"
                      ? "border-primary bg-primary"
                      : "border-gray-200 bg-white"
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  "활동중 프리미엄 말풍선",
                  "광고 제거",
                  "인증 카드 테마",
                  "프리미엄 칭호",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2">
                    <HiCheckCircle
                      className={`text-base flex-shrink-0 transition-colors ${
                        selectedPlan === "monthly"
                          ? "text-primary"
                          : "text-gray-200"
                      }`}
                    />
                    <p className="text-sm text-gray-600">{text}</p>
                  </div>
                ))}
              </div>
              <button
                disabled
                className={`w-full py-3.5 rounded-2xl font-extrabold text-sm cursor-not-allowed transition-all ${
                  selectedPlan === "monthly"
                    ? "bg-gradient-to-r from-primary to-secondary text-white opacity-60"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                월간 시작하기 · 준비중
              </button>
            </div>

            {/* 연간 카드 (추천) */}
            <div
              onClick={() => setSelectedPlan("annual")}
              className={`cursor-pointer bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4 border-2 transition-all relative ${
                selectedPlan === "annual" ? "border-primary" : "border-gray-100"
              }`}
            >
              <div className="absolute -top-3 right-4 flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                <HiStar className="text-yellow-300 text-sm" />
                추천
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">연간</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">
                    ₩44,000
                    <span className="text-base font-semibold text-gray-400 ml-1">
                      / 년
                    </span>
                  </p>
                  <p
                    className={`text-xs font-bold mt-1 transition-colors ${
                      selectedPlan === "annual"
                        ? "text-primary"
                        : "text-gray-400"
                    }`}
                  >
                    월 평균 3,600원
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-1 flex-shrink-0 transition-all ${
                    selectedPlan === "annual"
                      ? "border-primary bg-primary"
                      : "border-gray-200 bg-white"
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  "활동중 프리미엄 말풍선",
                  "광고 제거",
                  "인증 카드 테마",
                  "프리미엄 칭호",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2">
                    <HiCheckCircle
                      className={`text-base flex-shrink-0 transition-colors ${
                        selectedPlan === "annual"
                          ? "text-primary"
                          : "text-gray-200"
                      }`}
                    />
                    <p className="text-sm text-gray-600">{text}</p>
                  </div>
                ))}
              </div>
              <button
                disabled
                className={`w-full py-3.5 rounded-2xl font-extrabold text-sm cursor-not-allowed transition-all ${
                  selectedPlan === "annual"
                    ? "bg-gradient-to-r from-primary to-secondary text-white opacity-60"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                연간 시작하기 · 준비중
              </button>
            </div>
          </>
        )}

        {/* ── 시즌 ── */}
        {tab === "season" && (
          <div className="flex flex-col items-center justify-center py-16 gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg">
              <HiCalendar className="text-4xl text-white" />
            </div>
            <div className="text-center">
              <p className="text-gray-800 font-extrabold text-xl">곧 출시</p>
              <p className="text-gray-400 text-sm mt-1">
                시즌 이벤트를 준비 중이에요!
              </p>
            </div>
            <div className="bg-white rounded-3xl shadow-sm px-6 py-5 w-full max-w-xs flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-500 text-center">
                예고 보상
              </p>
              {SEASON_PREVIEWS.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 opacity-60"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}
                  >
                    <item.Icon className={`text-lg ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-600">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-300 font-semibold flex items-center gap-1">
              시즌 업데이트를 기대해주세요
              <HiSparkles className="text-gray-300" />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
