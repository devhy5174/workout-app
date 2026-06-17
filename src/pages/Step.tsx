import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
} from "react-icons/hi2";
import { isPremiumStepsTab } from "../utils/premiumNavigation";
import { useUser } from "../context/UserContext";
import { usePremium } from "../context/PremiumContext";
import {
  useActiveBubble,
  PREMIUM_BUBBLE_IDS,
} from "../context/ActiveBubbleContext";
import { useUnlockItems } from "../hooks/useUnlockItems";
import { useEventGrants } from "../hooks/useEventGrants";
import { unlockItems } from "../data/unlockItems";
import type { UnlockItemType } from "../data/unlockItems";
import { BUBBLE_PREVIEWS } from "../data/bubblePreviews";
import { POST_FRAMES } from "../data/postFrames";
import { useActiveFrame } from "../context/ActiveFrameContext";
import {
  useEvents,
  getRewardLabel,
  getConditionLabel,
  getEventStatus,
} from "../hooks/useEvents";
import { CATEGORY_META } from "../data/events";
import type { AppEvent } from "../data/events";
import { autoGrantFixedEvent } from "../lib/eventService";
import { calcStreakSince } from "../utils/streak";
import AlertModal from "../components/ui/AlertModal";
import { IoInformationCircle, IoFootsteps } from "react-icons/io5";

type Tab = "step" | "premium" | "events";
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

const PREMIUM_TYPE_ORDER: UnlockItemType[] = [
  "activeBubble",
  "postFrame",
  "title",
  "premium",
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

const PREMIUM_PLAN_BENEFITS = [
  "재미있는 월간 리포트 & 나의 숨겨진 유산소 MBTI",
  "다양한 활동중 프리미엄 말풍선",
  "인증 카드 테마",
  "프리미엄 칭호",
  "광고 없이 즐기는 클린 앱 환경",
] as const;

// ── 연속 챌린지 카드 (관리자 streak 이벤트 기반) ─────────
function StreakChallengeCard({
  event,
  streak,
}: {
  event: AppEvent;
  streak: number;
}) {
  const target = event.conditionValue;
  const isCompleted = streak >= target;
  const [showInfo, setShowInfo] = useState(false);

  // 최대 30개 dot으로 시각화, 초과분은 비율로 매핑
  const DOT_COUNT = Math.min(target, 30);
  const scale = target / DOT_COUNT;

  const rewardLabel =
    event.reward.type === "title"
      ? (event.reward.titleText ?? "칭호 보상")
      : (BUBBLE_PREVIEWS[event.reward.bubbleId ?? ""]?.text ?? "말풍선 보상");

  return (
    <div className="rounded-2xl bg-white shadow-sm p-5">
      {showInfo && (
        <AlertModal
          icon={IoFootsteps}
          iconClass="text-primary"
          title="연속 챌린지 기준"
          message={
            <span>
              하루 총 걸음수가 <strong className="text-gray-700">1,000보 이상</strong>이어야
              {" "}연속 일수에 카운트돼요.{"\n\n"}
              하루라도 빠지면 처음부터 다시 시작되니 매일 꾸준히 걸어보세요!
            </span>
          }
          confirmLabel="확인"
          onConfirm={() => setShowInfo(false)}
          zClass="z-[60]"
        />
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-extrabold text-gray-800 text-sm">{event.title}</p>
            <button
              onClick={() => setShowInfo(true)}
              aria-label="챌린지 기준 안내"
              className="text-gray-400 flex-shrink-0 active:scale-90 transition"
            >
              <IoInformationCircle size={15} />
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {event.description || "하루라도 빠지면 처음부터 다시 시작돼요"}
          </p>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <span
            className="text-xl font-extrabold"
            style={{ color: "var(--color-primary)" }}
          >
            {Math.min(streak, target)}
          </span>
          <span className="text-xs text-gray-400 font-bold"> / {target}일</span>
        </div>
      </div>

      {/* dots grid */}
      <div className="grid grid-cols-10 gap-1 mb-3">
        {Array.from({ length: DOT_COUNT }, (_, i) => {
          const dayThreshold = Math.round((i + 1) * scale);
          const isFilled = streak >= dayThreshold;
          const isGoal = i === DOT_COUNT - 1;
          return (
            <div key={i} className="flex items-center justify-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isGoal
                    ? isCompleted
                      ? "ring-2 ring-amber-400 ring-offset-1"
                      : "ring-2 ring-amber-200 ring-offset-1 bg-gray-50"
                    : !isFilled
                      ? "bg-gray-100"
                      : ""
                }`}
                style={isFilled ? { background: "var(--color-primary)" } : {}}
              >
                {isGoal && (
                  <span className="text-[10px]">
                    {isCompleted ? "🏆" : "🎯"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 보상 미리보기 */}
      <div
        className={`flex items-center gap-3 rounded-xl p-3 ${
          isCompleted ? "bg-amber-50" : "bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-extrabold px-2 py-1 rounded-full whitespace-nowrap leading-tight">
            {rewardLabel}
          </div>
          <div className="w-2 h-2 bg-amber-500 rotate-45 rounded-[1px] -mt-1" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-bold ${
              isCompleted ? "text-amber-700" : "text-gray-600"
            }`}
          >
            {isCompleted
              ? event.isFixed
                ? "해금됨! 🎉"
                : "달성 완료! 보상 지급 대기 중 🎉"
              : "달성 시 보상 지급"}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {isCompleted
              ? event.isFixed
                ? "아래 목록에서 보상을 선택하세요"
                : "이벤트 종료 후 관리자가 보상을 지급합니다"
              : streak > 0
                ? `${target - streak}일 더 연속 운동하면 달성!`
                : "오늘부터 시작해보세요 💪"}
          </p>
        </div>
        {isCompleted && (
          <span
            className={`flex-shrink-0 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
              event.isFixed ? "bg-emerald-400" : "bg-amber-400"
            }`}
          >
            {event.isFixed ? "해금 ✓" : "달성 ✓"}
          </span>
        )}
      </div>
    </div>
  );
}

// ── 이벤트 카드 ──────────────────────────────────────────
function EventCard({ event }: { event: AppEvent }) {
  const catMeta = CATEGORY_META[event.category];
  const status = getEventStatus(event);
  const rewardLabel = getRewardLabel(event);
  const conditionLabel = getConditionLabel(event);

  // 남은 일수 계산
  const today = new Date().toISOString().slice(0, 10);
  const endMs = new Date(event.endDate).getTime();
  const todayMs = new Date(today).getTime();
  const daysLeft = Math.ceil((endMs - todayMs) / (1000 * 60 * 60 * 24));

  const isNew =
    Date.now() - new Date(event.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-50">
      {/* 상단: 배지 + 남은 일수 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${catMeta.bg} ${catMeta.color}`}
          >
            {catMeta.emoji} {catMeta.label}
          </span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${status.color}`}
          >
            {status.label}
          </span>
          {isNew && (
            <span
              className="text-[8px] font-extrabold px-1 py-px rounded-full text-white"
              style={{
                background: "linear-gradient(135deg, #fcd34d, #f59e0b)",
              }}
            >
              New
            </span>
          )}
        </div>
        {daysLeft > 0 && (
          <span className="text-[11px] font-bold text-gray-400">
            D-{daysLeft}
          </span>
        )}
      </div>

      {/* 제목 + 설명 */}
      <p className="font-extrabold text-gray-800 text-sm mb-1">{event.title}</p>
      {event.description && (
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          {event.description}
        </p>
      )}

      {/* 조건 + 보상 */}
      <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 font-bold w-8 flex-shrink-0">
            목표
          </span>
          <span className="text-[11px] text-gray-700 font-semibold">
            {conditionLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 font-bold w-8 flex-shrink-0">
            보상
          </span>
          <span className="text-[11px] text-[var(--color-primary)] font-semibold">
            {rewardLabel}
          </span>
        </div>
      </div>

      {/* 날짜 */}
      <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-gray-300 font-semibold">
        <HiCalendar className="text-xs" />
        <span>
          {event.startDate} ~ {event.endDate}
        </span>
      </div>
    </div>
  );
}

export default function Step() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [tab, setTab] = useState<Tab>(() =>
    isPremiumStepsTab(tabFromUrl) ? tabFromUrl : "step",
  );
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("annual");
  const [activePremiumItems, setActivePremiumItems] = useState<
    Record<string, string>
  >({});
  const { user, workoutRecords, userProfile, updateProfile } = useUser();
  const { grantedBubbleIds, grantedTitles } = useEventGrants(user?.id);
  const {
    itemsWithStatus,
    totalSteps,
    monthlyAverageSteps,
    consecutiveStreak,
  } = useUnlockItems(workoutRecords, grantedBubbleIds);
  const { events, byCategory, activeEvents, hasNewEvents, markEventsSeen } =
    useEvents();
  const [eventSubTab, setEventSubTab] = useState<"active" | "past">("active");

  // 1000보 이상인 날짜 목록 (이벤트 시작일 기준 streak 계산용)
  const qualifiedStepDates = useMemo(() => {
    const stepsByDate: Record<string, number> = {};
    for (const r of workoutRecords) {
      stepsByDate[r.date] = (stepsByDate[r.date] ?? 0) + r.steps;
    }
    return Object.entries(stepsByDate)
      .filter(([, steps]) => steps >= 1000)
      .map(([date]) => date);
  }, [workoutRecords]);

  // eventOnly 아이템의 진행률 — 연결된 이벤트 조건 기준
  const eventProgressMap = new Map<string, { current: number; target: number; label: string }>();
  for (const ev of activeEvents) {
    let current = 0;
    let label = "";
    if (ev.category === "streak") {
      // 이벤트 시작일 이후 연속 일수만 카운트
      const eventStreak = calcStreakSince(qualifiedStepDates, ev.startDate);
      current = eventStreak;
      label = `${eventStreak} / ${ev.conditionValue}일`;
    } else if (ev.category === "personal") {
      if (ev.conditionType === "avg_steps") {
        current = monthlyAverageSteps;
        label = `평균 ${monthlyAverageSteps.toLocaleString()} / ${ev.conditionValue.toLocaleString()}보`;
      } else {
        current = totalSteps;
        label = `${totalSteps.toLocaleString()} / ${ev.conditionValue.toLocaleString()}보`;
      }
    }
    const prog = { current, target: ev.conditionValue, label };
    if (ev.reward.bubbleId) eventProgressMap.set(ev.reward.bubbleId, prog);
    if (ev.reward.titleText) eventProgressMap.set(`title:${ev.reward.titleText}`, prog);
  }

  const today = new Date().toISOString().slice(0, 10);
  const pastEvents = events
    .filter((e) => e.isActive && !e.isFixed && e.endDate < today)
    .sort((a, b) => b.endDate.localeCompare(a.endDate));
  const pastByCategory = {
    personal: pastEvents.filter((e) => e.category === "personal"),
    party: pastEvents.filter((e) => e.category === "party"),
    streak: pastEvents.filter((e) => e.category === "streak"),
  } as const;

  // 고정 streak 이벤트 조건 달성 시 자동 지급 (이벤트 시작일 기준 streak 사용)
  const autoGrantedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!user) return;
    byCategory.streak.forEach((event) => {
      if (!event.isFixed) return;
      const eventStreak = calcStreakSince(qualifiedStepDates, event.startDate);
      if (eventStreak < event.conditionValue) return;
      if (autoGrantedRef.current.has(event.id)) return;
      autoGrantedRef.current.add(event.id);
      autoGrantFixedEvent(event.id, user.id, event.reward);
    });
  }, [byCategory.streak, qualifiedStepDates, user]);

  const { isPremium, trialDaysLeft, startTrial } = usePremium();
  const { selectedBubbleId, setSelectedBubbleId } = useActiveBubble();
  const { selectedFrameId, setSelectedFrameId } = useActiveFrame();

  useEffect(() => {
    if (!isPremium) {
      if (PREMIUM_BUBBLE_IDS.has(selectedBubbleId))
        setSelectedBubbleId("basic_bubble");
      if (POST_FRAMES[selectedFrameId]?.premium)
        setSelectedFrameId("basic_post_frame");
    }
  }, [isPremium]);

  const handleTitleSelect = async (itemName: string) => {
    const next = userProfile?.title === itemName ? null : itemName;
    await updateProfile({ title: next });
  };

  const normalItems = itemsWithStatus.filter((i) => i.category === "normal" || i.category === "event");
  const premiumItems = unlockItems.filter((i) => i.category === "premium");

  const togglePremiumItem = (type: string, id: string) => {
    setActivePremiumItems((prev) => ({
      ...prev,
      [type]: prev[type] === id ? "" : id,
    }));
  };

  useEffect(() => {
    if (isPremiumStepsTab(tabFromUrl)) {
      setTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const selectTab = (key: Tab) => {
    setTab(key);
    setSearchParams({ tab: key }, { replace: true });
    if (key === "events") markEventsSeen();
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "step", label: "STEP 보상" },
    { key: "premium", label: "프리미엄" },
    { key: "events", label: "이벤트" },
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
            onClick={() => selectTab(key)}
            className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === key ? "bg-primary text-white shadow-sm" : "text-gray-400"
            }`}
          >
            {label}
            {key === "events" && hasNewEvents && tab !== "events" && (
              <span className="absolute top-1 right-3 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-yellow-400 opacity-70" />
                <span className="relative min-w-[16px] h-4 px-1 rounded-full bg-yellow-400 text-gray-800 text-[9px] font-extrabold flex items-center justify-center leading-none shadow-sm">
                  N
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-24 flex flex-col gap-5">
        {/* ── STEP 보상 ── */}
        {tab === "step" && byCategory.streak.length > 0 && (
          <>
            {byCategory.streak.map((event) => (
              <StreakChallengeCard
                key={event.id}
                event={event}
                streak={calcStreakSince(qualifiedStepDates, event.startDate)}
              />
            ))}
          </>
        )}

        {tab === "step" &&
          NORMAL_TYPE_ORDER.map((type) => {
            const group = normalItems.filter((i) => i.type === type);
            if (group.length === 0) return null;
            const meta = TYPE_META[type];
            return (
              <div key={type}>
                <p className="text-xs font-bold text-gray-500 px-1 mb-2 flex items-center gap-1.5">
                  <meta.Icon className={`text-sm ${meta.iconColor}`} />
                  {meta.label}
                </p>
                <div className="flex flex-col gap-2">
                  {group.map((item) => {
                    const isSelectable =
                      (type === "activeBubble" ||
                        type === "title" ||
                        type === "postFrame") &&
                      item.unlocked;
                    const isSelected =
                      type === "activeBubble"
                        ? selectedBubbleId === item.id
                        : type === "title"
                          ? userProfile?.title === item.name
                          : type === "postFrame"
                            ? selectedFrameId === item.id
                            : false;
                    const handleSelect = () => {
                      if (type === "activeBubble") setSelectedBubbleId(item.id);
                      else if (type === "title") handleTitleSelect(item.name);
                      else if (type === "postFrame")
                        setSelectedFrameId(item.id);
                    };
                    return (
                      <div
                        key={item.id}
                        onClick={isSelectable ? handleSelect : undefined}
                        className={`rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 transition-all border-2 ${
                          isSelectable
                            ? "cursor-pointer active:scale-[0.98]"
                            : ""
                        } ${
                          isSelected
                            ? "bg-white border-primary/30"
                            : item.unlocked
                              ? "bg-white border-transparent"
                              : "bg-gray-50 border-transparent"
                        }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            (type === "activeBubble" &&
                              BUBBLE_PREVIEWS[item.id]) ||
                            (type === "postFrame" && POST_FRAMES[item.id])
                              ? ""
                              : item.unlocked
                                ? meta.bgColor
                                : "bg-gray-100"
                          }`}
                        >
                          {type === "activeBubble" &&
                          BUBBLE_PREVIEWS[item.id] ? (
                            <div
                              className={`flex flex-col items-center ${!item.unlocked ? "opacity-40" : ""}`}
                            >
                              <div
                                className={`${BUBBLE_PREVIEWS[item.id].colorClass} ${BUBBLE_PREVIEWS[item.id].premium ? "animate-premium-bubble" : ""} ${BUBBLE_PREVIEWS[item.id].darkText ? "text-stone-800" : "text-white"} text-[7px] font-extrabold px-1.5 py-1.5 rounded-full whitespace-nowrap leading-none`}
                              >
                                {BUBBLE_PREVIEWS[item.id].text}
                              </div>
                              <div
                                className={`w-2 h-2 ${BUBBLE_PREVIEWS[item.id].colorClass} ${BUBBLE_PREVIEWS[item.id].premium ? "animate-premium-bubble" : ""} rotate-45 rounded-[1px] -mt-1`}
                              />
                            </div>
                          ) : type === "postFrame" && POST_FRAMES[item.id] ? (
                            <div
                              className={`${!item.unlocked ? "opacity-40" : ""} ${
                                POST_FRAMES[item.id].premium
                                  ? `p-[2px] rounded-xl ${POST_FRAMES[item.id].wrapperClass}`
                                  : ""
                              }`}
                            >
                              <div
                                className={`w-8 h-10 rounded-[9px] flex items-center justify-center ${
                                  POST_FRAMES[item.id].premium
                                    ? "bg-white"
                                    : "border-2 border-stone-200 bg-stone-50"
                                }`}
                              >
                                <HiPhoto
                                  className={`text-base ${isSelected ? meta.iconColor : "text-stone-300"}`}
                                />
                              </div>
                            </div>
                          ) : item.unlocked ? (
                            <meta.Icon
                              className={`text-xl ${meta.iconColor}`}
                            />
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
                              : item.condition?.consecutiveDays
                                ? `${item.condition.consecutiveDays}일 연속 운동 필요`
                                : item.description}
                          </p>
                          {/* 이벤트 전용 진행 게이지 */}
                          {!item.unlocked && item.eventOnly && (() => {
                            const prog = eventProgressMap.get(item.id) ?? eventProgressMap.get(`title:${item.name}`);
                            if (!prog) return null;
                            const pct = Math.min((prog.current / prog.target) * 100, 100);
                            return (
                              <div className="mt-2">
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "var(--color-primary)", opacity: 0.5 }} />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {prog.label}{pct >= 100 ? " ✓" : ` (${Math.floor(pct)}%)`}
                                </p>
                              </div>
                            );
                          })()}
                          {/* 해금 진행 게이지 — 잠긴 아이템 + 조건 있을 때만 표시 */}
                          {!item.unlocked && (item.condition?.monthlyAverageStep || item.condition?.consecutiveDays) && (() => {
                            const current = item.condition?.monthlyAverageStep
                              ? monthlyAverageSteps
                              : consecutiveStreak;
                            const target = item.condition?.monthlyAverageStep
                              ? item.condition.monthlyAverageStep
                              : item.condition!.consecutiveDays!;
                            const pct = Math.min((current / target) * 100, 100);
                            const label = item.condition?.monthlyAverageStep
                              ? `${monthlyAverageSteps.toLocaleString()} / ${target.toLocaleString()}보`
                              : `${consecutiveStreak} / ${target}일`;
                            return (
                              <div className="mt-2">
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                      width: `${pct}%`,
                                      background: "var(--color-primary)",
                                      opacity: 0.5,
                                    }}
                                  />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {label}
                                  {pct >= 100 ? " ✓" : ` (${Math.floor(pct)}%)`}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                        {isSelectable ? (
                          isSelected ? (
                            <span className="flex-shrink-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                              적용됨 ✓
                            </span>
                          ) : (
                            <span className="flex-shrink-0 bg-green-100 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full">
                              선택하기
                            </span>
                          )
                        ) : item.unlocked ? (
                          <span className="flex-shrink-0 bg-green-100 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full">
                            해금됨
                          </span>
                        ) : (
                          <span className="flex-shrink-0 text-xs text-gray-400 font-bold">
                            {item.eventOnly
                              ? (() => {
                                  const prog = eventProgressMap.get(item.id) ?? eventProgressMap.get(`title:${item.name}`);
                                  return prog ? `${prog.current}/${prog.target}${prog.label.includes("일") ? "일" : "보"}` : "";
                                })()
                              : item.condition?.monthlyAverageStep
                                ? `${item.condition.monthlyAverageStep.toLocaleString()}보`
                                : item.condition?.consecutiveDays
                                  ? `${consecutiveStreak}/${item.condition.consecutiveDays}일`
                                  : ""}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        {/* ── 이벤트 한정 보상 (동적) ── */}
        {tab === "step" && (() => {
          const grantedBubbleSet = new Set(grantedBubbleIds);
          const grantedTitleSet = new Set(grantedTitles);
          const unlockItemIds = new Set(unlockItems.map((i) => i.id));

          const dynItems = activeEvents.flatMap((ev) => {
            const rows: { key: string; kind: "bubble" | "title"; bubbleId?: string; titleText?: string; ev: typeof ev; unlocked: boolean }[] = [];
            const { reward } = ev;
            if ((reward.type === "bubble" || reward.type === "both") && reward.bubbleId && !unlockItemIds.has(reward.bubbleId)) {
              rows.push({ key: `b-${ev.id}`, kind: "bubble", bubbleId: reward.bubbleId, ev, unlocked: grantedBubbleSet.has(reward.bubbleId) });
            }
            if ((reward.type === "title" || reward.type === "both") && reward.titleText && !grantedTitleSet.has(reward.titleText)) {
              rows.push({ key: `t-${ev.id}`, kind: "title", titleText: reward.titleText, ev, unlocked: false });
            }
            return rows;
          });

          if (dynItems.length === 0) return null;
          return (
            <div>
              <p className="text-xs font-bold text-gray-500 px-1 mb-2 flex items-center gap-1.5">
                <HiSparkles className="text-sm text-amber-400" />
                이벤트 한정 보상
              </p>
              <div className="flex flex-col gap-2">
                {dynItems.map((item) => {
                  const prog = eventProgressMap.get(item.bubbleId ?? "") ?? eventProgressMap.get(`title:${item.titleText ?? ""}`);
                  const pct = prog ? Math.min((prog.current / prog.target) * 100, 100) : 0;
                  const rightLabel = prog
                    ? `${prog.current}/${prog.target}${prog.label.includes("일") ? "일" : "보"}`
                    : "";

                  const bubble = item.kind === "bubble" ? BUBBLE_PREVIEWS[item.bubbleId!] : null;

                  return (
                    <div key={item.key} className="rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 bg-white border-2 border-transparent">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 opacity-40">
                        {bubble ? (
                          <div className="flex flex-col items-center">
                            <div className={`${bubble.colorClass} ${bubble.darkText ? "text-stone-800" : "text-white"} text-[7px] font-extrabold px-1.5 py-1.5 rounded-full whitespace-nowrap leading-none`}>{bubble.text}</div>
                            <div className={`w-2 h-2 ${bubble.colorClass} rotate-45 rounded-[1px] -mt-1`} />
                          </div>
                        ) : (
                          <HiStar className="text-xl text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-400">{bubble ? bubble.text : item.titleText}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.ev.title} 이벤트 보상</p>
                        {prog && (
                          <div className="mt-2">
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "var(--color-primary)", opacity: 0.5 }} />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">{prog.label}{pct >= 100 ? " ✓" : ` (${Math.floor(pct)}%)`}</p>
                          </div>
                        )}
                      </div>
                      <span className="flex-shrink-0 text-xs text-gray-400 font-bold">{rightLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── 이벤트 보상 칭호 ── */}
        {tab === "step" && grantedTitles.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 px-1 mb-2 flex items-center gap-1.5">
              <HiSparkles className="text-sm text-amber-400" />
              이벤트 보상 칭호
            </p>
            <div className="flex flex-col gap-2">
              {grantedTitles.map((title) => {
                const isSelected = userProfile?.title === title;
                return (
                  <div
                    key={title}
                    onClick={() => handleTitleSelect(title)}
                    className={`rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all border-2 ${
                      isSelected
                        ? "bg-white border-primary/30"
                        : "bg-white border-transparent"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-amber-50">
                      <HiStar className="text-xl text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800">{title}</p>
                      <p className="text-xs text-amber-500 mt-0.5 font-semibold">
                        이벤트 보상 칭호
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="flex-shrink-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                        적용됨 ✓
                      </span>
                    ) : (
                      <span className="flex-shrink-0 bg-green-100 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full">
                        선택하기
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 프리미엄 ── */}
        {tab === "premium" && (
          <>
            {!isPremium ? (
              <button
                type="button"
                onClick={startTrial}
                className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-7 flex items-center justify-between shadow-md active:scale-95 transition min-h-[44px]"
                aria-label="프리미엄 7일 무료 체험하기"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-white font-extrabold text-sm">
                    ✨ 7일 무료 체험하기
                  </span>
                  <span className="text-white/70 text-[10px] font-semibold">
                    모든 프리미엄 기능을 7일간 무료로!
                  </span>
                </div>
                <span className="text-white font-extrabold text-xs bg-white/20 px-2.5 py-1 rounded-full shrink-0">
                  무료
                </span>
              </button>
            ) : (
              <div className="w-full rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 flex items-center justify-between min-h-[44px]">
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-extrabold text-primary">
                    ✨ 프리미엄 체험 중
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400">
                    {trialDaysLeft}일 후 체험이 종료돼요
                  </span>
                </div>
                <span className="text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full shrink-0">
                  D-{trialDaysLeft}
                </span>
              </div>
            )}
            {/* 히어로 카드 */}
            <div className="rounded-3xl bg-gradient-to-br from-primary to-secondary p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <HiSparkles className="text-lg text-white/80" />
                <p className="text-white font-extrabold text-sm tracking-wide">
                  PREMIUM MEMBER
                </p>
              </div>
              <p className="text-white/60 text-[10px] font-bold mb-3 tracking-wide">
                활동 중 말풍선 미리보기
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-3">
                {Object.entries(BUBBLE_PREVIEWS)
                  .filter(([, v]) => v.premium)
                  .map(([id, bubble]) => (
                    <div key={id} className="flex flex-col items-center">
                      <div
                        className={`${bubble.colorClass} animate-premium-bubble ${bubble.darkText ? "text-stone-800" : "text-white"} text-[9px] font-extrabold px-2 py-1 rounded-full whitespace-nowrap leading-none`}
                      >
                        {bubble.text}
                      </div>
                      <div
                        className={`w-2 h-2 ${bubble.colorClass} animate-premium-bubble rotate-45 rounded-[1px] -mt-1`}
                      />
                    </div>
                  ))}
              </div>

              {/* 프리미엄 칭호 */}
              <p className="text-white/60 text-[10px] font-bold mt-4 mb-2.5 tracking-wide">
                프리미엄 칭호
              </p>
              <div className="flex flex-wrap gap-2">
                {unlockItems
                  .filter((i) => i.type === "title" && i.category === "premium")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1"
                    >
                      <HiStar className="text-yellow-300 text-[10px] flex-shrink-0" />
                      <span className="text-white text-[10px] font-extrabold whitespace-nowrap">
                        {item.name}
                      </span>
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
                {PREMIUM_PLAN_BENEFITS.map((text) => (
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
                {PREMIUM_PLAN_BENEFITS.map((text) => (
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

            {/* 프리미엄 아이템 선택 */}
            {isPremium && (
              <p className="text-xs font-bold text-gray-500 px-1 flex items-center gap-1.5">
                <HiSparkles className="text-amber-400 text-sm" />
                구독 시 선택 가능 아이템
              </p>
            )}
            {isPremium &&
              PREMIUM_TYPE_ORDER.map((type) => {
                const group = premiumItems.filter((i) => i.type === type);
                if (group.length === 0) return null;
                const meta = TYPE_META[type];
                return (
                  <div key={type}>
                    <p className="text-xs font-bold text-gray-400 px-1 mb-2 flex items-center gap-1">
                      <meta.Icon className={`text-sm ${meta.iconColor}`} />
                      {meta.label}
                    </p>
                    <div className="flex flex-col gap-2">
                      {group.map((item) => {
                        const isUserSelectable =
                          type === "activeBubble" ||
                          type === "title" ||
                          type === "postFrame";
                        const isActive =
                          type === "activeBubble"
                            ? selectedBubbleId === item.id
                            : type === "title"
                              ? userProfile?.title === item.name
                              : type === "postFrame"
                                ? selectedFrameId === item.id
                                : activePremiumItems[type] === item.id;
                        const handlePremiumItemClick = () => {
                          if (!isPremium && isUserSelectable) return;
                          if (type === "activeBubble")
                            setSelectedBubbleId(item.id);
                          else if (type === "title")
                            handleTitleSelect(item.name);
                          else if (type === "postFrame")
                            setSelectedFrameId(item.id);
                          else togglePremiumItem(type, item.id);
                        };
                        return (
                          <button
                            key={item.id}
                            onClick={handlePremiumItemClick}
                            disabled={isUserSelectable && !isPremium}
                            className={`rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 transition-all text-left w-full border-2 ${
                              isUserSelectable && !isPremium
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            } ${
                              isActive
                                ? "bg-white border-amber-400"
                                : "bg-gray-50 border-transparent"
                            }`}
                          >
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                (type === "activeBubble" &&
                                  BUBBLE_PREVIEWS[item.id]) ||
                                (type === "postFrame" && POST_FRAMES[item.id])
                                  ? ""
                                  : isActive
                                    ? meta.bgColor
                                    : "bg-gray-100"
                              }`}
                            >
                              {type === "activeBubble" &&
                              BUBBLE_PREVIEWS[item.id] ? (
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`${BUBBLE_PREVIEWS[item.id].colorClass} ${BUBBLE_PREVIEWS[item.id].premium ? "animate-premium-bubble" : ""} ${BUBBLE_PREVIEWS[item.id].darkText ? "text-stone-800" : "text-white"} text-[7px] font-extrabold px-1.5 py-1.5 rounded-full whitespace-nowrap leading-none`}
                                  >
                                    {BUBBLE_PREVIEWS[item.id].text}
                                  </div>
                                  <div
                                    className={`w-2 h-2 ${BUBBLE_PREVIEWS[item.id].colorClass} ${BUBBLE_PREVIEWS[item.id].premium ? "animate-premium-bubble" : ""} rotate-45 rounded-[1px] -mt-1`}
                                  />
                                </div>
                              ) : type === "postFrame" &&
                                POST_FRAMES[item.id] ? (
                                <div
                                  className={`p-[2px] rounded-xl ${POST_FRAMES[item.id].wrapperClass} ${isActive ? POST_FRAMES[item.id].animationClass : ""}`}
                                >
                                  <div className="w-8 h-10 rounded-[9px] bg-white flex items-center justify-center">
                                    <HiPhoto
                                      className={`text-base ${isActive ? meta.iconColor : "text-gray-300"}`}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <meta.Icon
                                  className={`text-xl ${isActive ? meta.iconColor : "text-gray-400"}`}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-bold text-sm ${isActive ? "text-gray-800" : "text-gray-400"}`}
                              >
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {item.description}
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                                isActive
                                  ? "border-amber-400 bg-amber-400"
                                  : "border-gray-200 bg-white"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </>
        )}

        {/* ── 이벤트 ── */}
        {tab === "events" && (
          <div className="flex flex-col gap-4 pb-4">
            {/* 서브 탭 */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {(["active", "past"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setEventSubTab(st)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    eventSubTab === st
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400"
                  }`}
                >
                  {st === "active"
                    ? `진행 중 ${activeEvents.length > 0 ? `(${activeEvents.length})` : ""}`
                    : `지난 이벤트 ${pastEvents.length > 0 ? `(${pastEvents.length})` : ""}`}
                </button>
              ))}
            </div>

            {/* 진행 중 탭 */}
            {eventSubTab === "active" && (
              <>
                {activeEvents.length === 0 && (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg">
                      <HiCalendar className="text-3xl text-white" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">
                      현재 진행 중인 이벤트가 없어요
                    </p>
                    <p className="text-xs text-gray-300 flex items-center gap-1">
                      이벤트를 기대해주세요{" "}
                      <HiSparkles className="text-gray-300" />
                    </p>
                    <div className="bg-white rounded-3xl shadow-sm px-6 py-5 w-full flex flex-col gap-3 mt-2">
                      {SEASON_PREVIEWS.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-3 opacity-50"
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
                  </div>
                )}
                {(["personal", "party", "streak"] as const).map((cat) => {
                  const catEvents = byCategory[cat];
                  if (catEvents.length === 0) return null;
                  return (
                    <div key={cat} className="flex flex-col gap-3">
                      {catEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  );
                })}
              </>
            )}

            {/* 지난 이벤트 탭 */}
            {eventSubTab === "past" && (
              <>
                {pastEvents.length === 0 && (
                  <div className="flex flex-col items-center py-12 gap-2">
                    <p className="text-sm font-bold text-gray-400">
                      지난 이벤트가 없어요
                    </p>
                    <p className="text-xs text-gray-300">
                      종료된 이벤트가 여기에 표시돼요
                    </p>
                  </div>
                )}
                {(["personal", "party", "streak"] as const).map((cat) => {
                  const catEvents = pastByCategory[cat];
                  if (catEvents.length === 0) return null;
                  return (
                    <div key={cat} className="flex flex-col gap-3 opacity-60">
                      {catEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
