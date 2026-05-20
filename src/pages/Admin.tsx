import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiRefresh,
  HiPlus,
  HiPencil,
  HiTrash,
  HiUsers,
  HiUserAdd,
  HiLightningBolt,
  HiChartBar,
  HiBadgeCheck,
  HiCalendar,
  HiSpeakerphone,
  HiFire,
  HiStar,
  HiSparkles,
  HiShieldCheck,
  HiColorSwatch,
  HiVolumeOff,
} from "react-icons/hi";
import { useAdminStats, type SubscriberStats } from "../hooks/useAdminStats";
import { useEvents, getEventStatus } from "../hooks/useEvents";
import { useUser } from "../context/UserContext";
import {
  fetchEventAchievers,
  grantEventReward,
  type Achiever,
} from "../lib/eventService";
import { useNotices } from "../context/NoticesContext";
import {
  CATEGORY_META,
  CATEGORY_CONDITIONS,
  CONDITION_META,
  REWARD_TYPE_META,
} from "../data/events";
import type {
  AppEvent,
  EventCategory,
  EventConditionType,
  EventRewardType,
} from "../data/events";
import { BUBBLE_PREVIEWS } from "../data/bubblePreviews";

// ── 공통 타입 ─────────────────────────────────────────────
type AdminTab = "dashboard" | "premium" | "events" | "notices";

const PREMIUM_BENEFITS = [
  {
    icon: <HiSparkles size={18} className="text-yellow-500" />,
    bg: "bg-yellow-50",
    label: "특별 말풍선",
    desc: "캐릭터 전용 프리미엄 말풍선",
  },
  {
    icon: <HiVolumeOff size={18} className="text-blue-500" />,
    bg: "bg-blue-50",
    label: "광고 없는 경험",
    desc: "모든 광고 제거",
  },
  {
    icon: <HiColorSwatch size={18} className="text-purple-500" />,
    bg: "bg-purple-50",
    label: "전용 카드 테마",
    desc: "프리미엄 전용 UI 테마",
  },
  {
    icon: <HiShieldCheck size={18} className="text-emerald-500" />,
    bg: "bg-emerald-50",
    label: "프리미엄 칭호",
    desc: "프로필 전용 칭호 표시",
  },
];

// ── 공통 컴포넌트 ─────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <p className="text-xs text-gray-400 font-semibold">{label}</p>
      {isLoading ? (
        <div className="h-7 bg-gray-100 rounded-lg animate-pulse w-16" />
      ) : (
        <p className="text-2xl font-extrabold text-gray-800">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      )}
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </div>
  );
}

// ── 이벤트 폼 시트 ────────────────────────────────────────
function EventFormSheet({
  initial,
  onSave,
  onClose,
}: {
  initial?: AppEvent;
  onSave: (data: Omit<AppEvent, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayStr);
  const [endDate, setEndDate] = useState(initial?.endDate ?? todayStr);
  const [isFixed, setIsFixed] = useState(initial?.isFixed ?? false);
  const [category, setCategory] = useState<EventCategory>(
    initial?.category ?? "personal",
  );
  const [conditionType, setConditionType] = useState<EventConditionType>(
    initial?.conditionType ?? "avg_steps",
  );
  const [conditionValue, setConditionValue] = useState(
    initial?.conditionValue?.toString() ?? "",
  );
  const [rewardType, setRewardType] = useState<EventRewardType>(
    initial?.reward.type ?? "bubble",
  );
  const [bubbleId, setBubbleId] = useState(initial?.reward.bubbleId ?? "");
  const [titleText, setTitleText] = useState(initial?.reward.titleText ?? "");
  const [error, setError] = useState<string | null>(null);

  // 카테고리 변경 시 조건 타입 초기화
  function handleCategoryChange(cat: EventCategory) {
    setCategory(cat);
    setConditionType(CATEGORY_CONDITIONS[cat][0]);
    setError(null);
  }

  function handleSave() {
    if (!title.trim()) return setError("이벤트 제목을 입력해주세요.");
    if (!isFixed && endDate < startDate)
      return setError("종료일이 시작일보다 빠를 수 없어요.");
    const val = parseInt(conditionValue, 10);
    if (!conditionValue || isNaN(val) || val <= 0)
      return setError("목표 값을 올바르게 입력해주세요.");
    if ((rewardType === "bubble" || rewardType === "both") && !bubbleId)
      return setError("말풍선을 선택해주세요.");
    if ((rewardType === "title" || rewardType === "both") && !titleText.trim())
      return setError("칭호 텍스트를 입력해주세요.");

    onSave({
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate,
      category,
      conditionType,
      conditionValue: val,
      reward: {
        type: rewardType,
        bubbleId: rewardType !== "title" ? bubbleId : undefined,
        titleText: rewardType !== "bubble" ? titleText.trim() : undefined,
      },
      isActive: initial?.isActive ?? true,
      isFixed,
    });
    onClose();
  }

  const availableConditions = CATEGORY_CONDITIONS[category];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 pb-10 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-extrabold text-gray-800">
            {initial ? "이벤트 수정" : "이벤트 추가"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 카테고리 */}
        <p className="text-xs font-bold text-gray-400 mb-2">이벤트 유형</p>
        <div className="flex gap-2 mb-4">
          {(Object.keys(CATEGORY_META) as EventCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                  category === cat
                    ? `${meta.bg} ${meta.color} ${meta.border}`
                    : "bg-gray-50 text-gray-400 border-transparent"
                }`}
              >
                {meta.emoji}{" "}
                {meta.label.replace(" 이벤트", "").replace(" 챌린지", "")}
              </button>
            );
          })}
        </div>

        {/* 제목 */}
        <p className="text-xs font-bold text-gray-400 mb-2">제목</p>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          placeholder="이벤트 제목"
          maxLength={40}
          className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none mb-4 placeholder:text-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]/30"
        />

        {/* 설명 */}
        <p className="text-xs font-bold text-gray-400 mb-2">설명 (선택)</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="이벤트 설명"
          maxLength={120}
          rows={2}
          className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-700 outline-none mb-4 resize-none placeholder:text-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]/30"
        />

        {/* 달성 조건 */}
        <p className="text-xs font-bold text-gray-400 mb-2">달성 조건</p>
        {availableConditions.length > 1 && (
          <div className="flex gap-2 mb-2">
            {availableConditions.map((ct) => (
              <button
                key={ct}
                onClick={() => setConditionType(ct)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                  conditionType === ct
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/30"
                    : "bg-gray-50 text-gray-400 border-transparent"
                }`}
              >
                {CONDITION_META[ct].label}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="number"
            value={conditionValue}
            onChange={(e) => {
              setConditionValue(e.target.value);
              setError(null);
            }}
            placeholder={CONDITION_META[conditionType].placeholder}
            min={1}
            className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none placeholder:text-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]/30"
          />
          <span className="text-xs font-bold text-gray-400 whitespace-nowrap pr-1">
            {CONDITION_META[conditionType].unit}
          </span>
        </div>

        {/* 보상 유형 */}
        <p className="text-xs font-bold text-gray-400 mb-2">보상 유형</p>
        <div className="flex gap-2 mb-3">
          {(Object.keys(REWARD_TYPE_META) as EventRewardType[]).map((rt) => {
            const meta = REWARD_TYPE_META[rt];
            return (
              <button
                key={rt}
                onClick={() => setRewardType(rt)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  rewardType === rt
                    ? "bg-violet-50 text-violet-600 border-violet-200"
                    : "bg-gray-50 text-gray-400 border-transparent"
                }`}
              >
                {meta.emoji} {meta.label}
              </button>
            );
          })}
        </div>

        {/* 말풍선 선택 */}
        {(rewardType === "bubble" || rewardType === "both") && (
          <>
            <p className="text-xs font-bold text-gray-400 mb-2">말풍선 선택</p>
            <select
              value={bubbleId}
              onChange={(e) => {
                setBubbleId(e.target.value);
                setError(null);
              }}
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none mb-4 focus:ring-2 focus:ring-[var(--color-primary)]/30"
            >
              <option value="">말풍선을 선택하세요</option>
              {Object.entries(BUBBLE_PREVIEWS).map(([id, bubble]) => (
                <option key={id} value={id}>
                  {bubble.text} {bubble.premium ? "(프리미엄)" : "(일반)"}
                </option>
              ))}
            </select>
          </>
        )}

        {/* 칭호 텍스트 */}
        {(rewardType === "title" || rewardType === "both") && (
          <>
            <p className="text-xs font-bold text-gray-400 mb-2">칭호 텍스트</p>
            <input
              type="text"
              value={titleText}
              onChange={(e) => {
                setTitleText(e.target.value);
                setError(null);
              }}
              placeholder="예: 🔥 30일 완주자"
              maxLength={20}
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none mb-4 placeholder:text-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
          </>
        )}

        {/* 기간 */}
        <p className="text-xs font-bold text-gray-400 mb-2">이벤트 기간</p>

        {/* 고정 이벤트 토글 */}
        <button
          type="button"
          onClick={() => setIsFixed((v) => !v)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-3 border-2 transition-all ${
            isFixed
              ? "bg-violet-50 border-violet-200"
              : "bg-gray-50 border-transparent"
          }`}
        >
          <div className="text-left">
            <p
              className={`text-sm font-extrabold ${isFixed ? "text-violet-700" : "text-gray-600"}`}
            >
              ♾️ 고정 이벤트
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isFixed
                ? "기간 제한 없이 내가 중지하기 전까지 유지돼요"
                : "체크하면 종료일 없이 항상 진행됩니다"}
            </p>
          </div>
          <div
            className={`w-11 h-6 rounded-full flex items-center transition-all flex-shrink-0 ml-3 ${
              isFixed ? "bg-violet-500" : "bg-gray-200"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-sm transition-all mx-0.5 ${
                isFixed ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </button>

        {!isFixed && (
          <div className="flex gap-2 mb-5">
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1 px-1">시작일</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-50 rounded-2xl px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1 px-1">종료일</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-50 rounded-2xl px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              />
            </div>
          </div>
        )}
        {isFixed && <div className="mb-5" />}

        {error && <p className="text-xs text-red-500 mb-3 px-1">{error}</p>}

        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition shadow-md"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          }}
        >
          {initial ? "수정 완료" : "이벤트 추가"}
        </button>
      </div>
    </div>
  );
}

// ── 시간대별 운동 차트 ────────────────────────────────────
const TIME_ZONE_LABELS: { label: string; range: string; color: string }[] = [
  { label: "새벽", range: "00–05", color: "text-indigo-400" },
  { label: "아침", range: "06–11", color: "text-amber-400" },
  { label: "오후", range: "12–17", color: "text-orange-400" },
  { label: "저녁", range: "18–23", color: "text-violet-400" },
];

function WorkoutHourlyChart({
  data,
  isLoading,
}: {
  data: number[];
  isLoading: boolean;
}) {
  const maxVal = Math.max(...data, 1);
  const total = data.reduce((s, v) => s + v, 0);

  const peakHour = data.indexOf(Math.max(...data));
  const peakLabel =
    peakHour < 6
      ? "새벽"
      : peakHour < 12
        ? "아침"
        : peakHour < 18
          ? "오후"
          : "저녁";

  const zoneCount = [
    data.slice(0, 6).reduce((s, v) => s + v, 0),
    data.slice(6, 12).reduce((s, v) => s + v, 0),
    data.slice(12, 18).reduce((s, v) => s + v, 0),
    data.slice(18, 24).reduce((s, v) => s + v, 0),
  ];
  const topZoneIdx = zoneCount.indexOf(Math.max(...zoneCount));

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-32 mb-4" />
        <div className="flex items-end gap-0.5 h-20">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-100 rounded-sm animate-pulse"
              style={{ height: `${30 + Math.random() * 70}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div
        className="px-5 py-3.5 flex items-center gap-2"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary)15, var(--color-secondary)15)",
        }}
      >
        <HiChartBar size={16} className="text-[var(--color-primary)]" />
        <p className="text-sm font-extrabold text-gray-800">
          시간대별 운동 시작
        </p>
        {total > 0 && (
          <span className="ml-auto text-[11px] font-bold text-gray-400">
            총 {total}회
          </span>
        )}
      </div>

      <div className="px-4 pt-4 pb-3">
        {total === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2 text-gray-300">
            <HiChartBar size={32} />
            <p className="text-xs font-bold">운동 기록이 없어요</p>
          </div>
        ) : (
          <>
            {/* 피크 시간 배지 */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[11px] font-extrabold px-2.5 py-1 rounded-full text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                피크 {String(peakHour).padStart(2, "0")}시 ({peakLabel})
              </span>
              <span className="text-[11px] text-gray-400 font-semibold">
                {data[peakHour]}회
              </span>
            </div>

            {/* 바 차트 */}
            <div className="flex items-end gap-px h-16 mb-1">
              {data.map((val, hour) => {
                const heightPct = (val / maxVal) * 100;
                const isNight = hour < 6;
                const isMorning = hour >= 6 && hour < 12;
                const isAfternoon = hour >= 12 && hour < 18;
                const isPeak = hour === peakHour;

                let barColor: string;
                if (isPeak) {
                  barColor =
                    "linear-gradient(to top, var(--color-primary), var(--color-secondary))";
                } else if (isNight) {
                  barColor = "linear-gradient(to top, #818cf8, #a5b4fc)";
                } else if (isMorning) {
                  barColor = "linear-gradient(to top, #fb923c, #fcd34d)";
                } else if (isAfternoon) {
                  barColor = "linear-gradient(to top, #f97316, #fdba74)";
                } else {
                  barColor = "linear-gradient(to top, #8b5cf6, #c4b5fd)";
                }

                return (
                  <div
                    key={hour}
                    className="flex-1 rounded-t-sm transition-all"
                    style={{
                      height: `${Math.max(heightPct, val > 0 ? 4 : 1)}%`,
                      background: val > 0 ? barColor : "#f3f4f6",
                      opacity: val === 0 ? 0.4 : 1,
                    }}
                    title={`${String(hour).padStart(2, "0")}시: ${val}회`}
                  />
                );
              })}
            </div>

            {/* x축 레이블 */}
            <div className="flex justify-between px-px mb-4">
              {["00", "06", "12", "18", "23"].map((t) => (
                <span
                  key={t}
                  className="text-[9px] text-gray-300 font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* 시간대별 요약 */}
            <div className="grid grid-cols-4 gap-2">
              {TIME_ZONE_LABELS.map((zone, i) => {
                const cnt = zoneCount[i];
                const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
                const isTop = i === topZoneIdx;
                return (
                  <div
                    key={zone.label}
                    className={`rounded-xl p-2 flex flex-col gap-0.5 transition-all ${
                      isTop
                        ? "bg-[var(--color-primary)]/8 ring-1 ring-[var(--color-primary)]/20"
                        : "bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-[11px] font-extrabold ${isTop ? "text-[var(--color-primary)]" : "text-gray-500"}`}
                    >
                      {zone.label}
                    </p>
                    <p
                      className={`text-[10px] font-semibold ${isTop ? "text-[var(--color-primary)]/70" : "text-gray-400"}`}
                    >
                      {zone.range}
                    </p>
                    <p
                      className={`text-sm font-extrabold ${isTop ? "text-[var(--color-primary)]" : "text-gray-700"}`}
                    >
                      {pct}%
                    </p>
                    <p className="text-[9px] text-gray-400 font-semibold">
                      {cnt}회
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── 탭: 대시보드 ──────────────────────────────────────────
function DashboardTab({
  stats,
  isLoading,
}: {
  stats: ReturnType<typeof useAdminStats>["stats"];
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 pb-28">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<HiUsers size={20} className="text-blue-500" />}
          label="총 회원 수"
          value={stats?.totalUsers ?? 0}
          sub="누적 가입자"
          color="bg-blue-50"
          isLoading={isLoading}
        />
        <StatCard
          icon={<HiUserAdd size={20} className="text-emerald-500" />}
          label="오늘 신규 유입"
          value={stats?.newUsersToday ?? 0}
          sub="오늘 가입자"
          color="bg-emerald-50"
          isLoading={isLoading}
        />
        <StatCard
          icon={<HiLightningBolt size={20} className="text-orange-500" />}
          label="오늘 운동한 유저"
          value={stats?.activeUsersToday ?? 0}
          sub="오늘 활성 유저"
          color="bg-orange-50"
          isLoading={isLoading}
        />
        <StatCard
          icon={<HiChartBar size={20} className="text-purple-500" />}
          label="누적 운동 세션"
          value={stats?.totalWorkouts ?? 0}
          sub="전체 운동 기록"
          color="bg-purple-50"
          isLoading={isLoading}
        />
      </div>

      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-3"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
        }}
      >
        <div className="flex-1">
          <p className="text-white/80 text-xs font-semibold">오늘 운동 세션</p>
          {isLoading ? (
            <div className="h-7 bg-white/20 rounded-lg animate-pulse w-20 mt-1" />
          ) : (
            <p className="text-white text-2xl font-extrabold">
              {stats?.workoutSessionsToday ?? 0}회
            </p>
          )}
        </div>
        <HiBadgeCheck size={40} className="text-white/30" />
      </div>

      <WorkoutHourlyChart
        data={stats?.hourlyDistribution ?? Array(24).fill(0)}
        isLoading={isLoading}
      />
    </div>
  );
}

// ── 탭: 프리미엄 구독 ─────────────────────────────────────
function PremiumTab({
  subscriberStats,
  totalUsers,
  isLoading,
}: {
  subscriberStats: SubscriberStats | null;
  totalUsers: number;
  isLoading: boolean;
}) {
  const RANK_MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
  const habitRate =
    totalUsers > 0
      ? Math.round(
          ((subscriberStats?.activeStreakUsers ?? 0) / totalUsers) * 100,
        )
      : 0;

  return (
    <div className="flex flex-col gap-4 p-4 pb-28">
      {/* 습관 달성 지표 */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<HiFire size={20} className="text-orange-500" />}
          label="꾸준한 유저"
          value={subscriberStats?.activeStreakUsers ?? 0}
          sub="7일+ 연속 운동"
          color="bg-orange-50"
          isLoading={isLoading}
        />
        <StatCard
          icon={<HiBadgeCheck size={20} className="text-yellow-500" />}
          label="파워 유저"
          value={subscriberStats?.powerUsers ?? 0}
          sub="30일+ 연속 운동"
          color="bg-yellow-50"
          isLoading={isLoading}
        />
      </div>

      {/* 습관 형성률 배너 */}
      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-4"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
        }}
      >
        <div className="flex-1">
          <p className="text-white/70 text-xs font-semibold mb-1">
            7일+ 습관 형성률
          </p>
          {isLoading ? (
            <div className="h-7 bg-white/20 rounded-lg animate-pulse w-20" />
          ) : (
            <div className="flex items-baseline gap-1">
              <p className="text-white text-3xl font-extrabold">{habitRate}%</p>
              <p className="text-white/60 text-xs">전체 대비</p>
            </div>
          )}
        </div>
        <HiStar size={44} className="text-white/20" />
      </div>

      {/* 프리미엄 혜택 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div
          className="px-5 py-3.5 flex items-center gap-2"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary)15, var(--color-secondary)15)",
          }}
        >
          <HiSparkles size={16} className="text-[var(--color-primary)]" />
          <p className="text-sm font-extrabold text-gray-800">
            프리미엄 구독 혜택
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {PREMIUM_BENEFITS.map((b) => (
            <div key={b.label} className="flex items-center gap-3 px-5 py-3.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${b.bg}`}
              >
                {b.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">{b.label}</p>
                <p className="text-[11px] text-gray-400">{b.desc}</p>
              </div>
              <HiBadgeCheck
                size={16}
                className="text-[var(--color-primary)] flex-shrink-0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 연속 운동 상위 유저 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div
          className="px-5 py-3.5 flex items-center gap-2"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary)15, var(--color-secondary)15)",
          }}
        >
          <HiFire size={16} className="text-[var(--color-primary)]" />
          <p className="text-sm font-extrabold text-gray-800">
            연속 운동 상위 유저
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-5 bg-gray-100 rounded animate-pulse" />
                <div className="flex-1 h-4 bg-gray-100 rounded-lg animate-pulse" />
                <div className="w-14 h-4 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : !subscriberStats?.topStreakUsers.length ? (
          <div className="flex flex-col items-center py-10 gap-2 text-gray-300">
            <HiUsers size={36} />
            <p className="text-sm font-bold">데이터가 없어요</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {subscriberStats.topStreakUsers.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-lg w-7 text-center flex-shrink-0">
                  {RANK_MEDALS[i]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {u.nickname ?? "익명"}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-base">🔥</span>
                  <p
                    className="text-sm font-extrabold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {u.streak ?? 0}일
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 탭: 공지사항 관리 ─────────────────────────────────────
function NoticesTab() {
  const {
    notices,
    activeNotice,
    addNotice,
    updateNotice,
    deleteNotice,
    toggleNotice,
  } = useNotices();
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  function handlePublish() {
    if (!draft.trim()) return;
    addNotice(draft.trim());
    setDraft("");
  }

  function startEdit(notice: { id: string; content: string }) {
    setEditingId(notice.id);
    setEditDraft(notice.content);
  }

  function handleEditSave(id: string) {
    if (!editDraft.trim()) return;
    updateNotice(id, editDraft.trim());
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-28">
      {/* 현재 표시 중인 공지 미리보기 */}
      {activeNotice ? (
        <div className="rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-2 bg-amber-50 border border-amber-100 flex items-start gap-2.5">
            <span className="text-base flex-shrink-0 mt-0.5">📢</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-amber-600 mb-0.5">
                현재 홈에 표시 중
              </p>
              <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                {activeNotice.content}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-3 flex items-center gap-2.5">
          <span className="text-base opacity-30">📢</span>
          <p className="text-xs text-gray-300 font-semibold">
            현재 표시 중인 공지가 없어요
          </p>
        </div>
      )}

      {/* 새 공지 작성 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div
          className="px-5 py-3.5 flex items-center gap-2"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary)12, var(--color-secondary)12)",
          }}
        >
          <HiSpeakerphone size={16} className="text-[var(--color-primary)]" />
          <p className="text-sm font-extrabold text-gray-800">새 공지 작성</p>
        </div>
        <div className="px-4 py-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="홈 화면 상단 배너에 표시할 내용을 입력하세요 (최대 80자)"
            maxLength={80}
            rows={3}
            className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none resize-none placeholder:text-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]/30 mb-2"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-300">{draft.length}/80</span>
            <button
              onClick={handlePublish}
              disabled={!draft.trim()}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-4 py-2 rounded-full disabled:opacity-40 active:scale-95 transition shadow-sm"
            >
              <HiSpeakerphone size={12} />
              공지 발행
            </button>
          </div>
        </div>
      </div>

      {/* 공지 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm font-extrabold text-gray-800">공지 이력</p>
          <span className="text-xs font-bold text-gray-400">
            {notices.length}개
          </span>
        </div>

        {notices.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2 text-gray-300">
            <HiSpeakerphone size={36} />
            <p className="text-sm font-bold">등록된 공지가 없어요</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={`px-4 py-3.5 transition-opacity ${!notice.isActive ? "opacity-50" : ""}`}
              >
                {editingId === notice.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      maxLength={80}
                      rows={2}
                      className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none resize-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSave(notice.id)}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] active:scale-95 transition"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold text-gray-400 bg-gray-100 active:scale-95 transition"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {notice.isActive && (
                        <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mr-1 mb-1">
                          표시 중
                        </span>
                      )}
                      <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                        {notice.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleNotice(notice.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                          notice.isActive
                            ? "text-gray-400 bg-gray-100"
                            : "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                        }`}
                        aria-label={notice.isActive ? "숨기기" : "표시"}
                      >
                        {notice.isActive ? "끄기" : "켜기"}
                      </button>
                      <button
                        onClick={() => startEdit(notice)}
                        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-400 transition-colors"
                        aria-label="수정"
                      >
                        <HiPencil size={13} />
                      </button>
                      <button
                        onClick={() => deleteNotice(notice.id)}
                        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors"
                        aria-label="삭제"
                      >
                        <HiTrash size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 달성자 시트 ───────────────────────────────────────────
function AchieversSheet({
  event,
  adminUserId,
  onClose,
}: {
  event: AppEvent;
  adminUserId: string;
  onClose: () => void;
}) {
  const [achievers, setAchievers] = useState<Achiever[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantingId, setGrantingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEventAchievers(event).then((data) => {
      setAchievers(data);
      setLoading(false);
    });
  }, [event]);

  async function handleGrant(achiever: Achiever) {
    setGrantingId(achiever.userId);
    const ok = await grantEventReward(
      event.id,
      achiever.userId,
      event.reward,
      adminUserId,
    );
    if (ok) {
      setAchievers((prev) =>
        prev.map((a) =>
          a.userId === achiever.userId ? { ...a, alreadyGranted: true } : a,
        ),
      );
    }
    setGrantingId(null);
  }

  async function handleGrantAll() {
    const pending = achievers.filter((a) => !a.alreadyGranted);
    for (const a of pending) {
      await handleGrant(a);
    }
  }

  const pendingCount = achievers.filter((a) => !a.alreadyGranted).length;
  const conditionLabel = `${event.conditionValue.toLocaleString()}${CONDITION_META[event.conditionType].unit}`;
  const catMeta = CATEGORY_META[event.category];

  // 파티 이벤트는 partyName 기준으로 그룹화
  const grouped =
    event.category === "party"
      ? achievers.reduce<Record<string, Achiever[]>>((acc, a) => {
          const key = a.partyName ?? "기타";
          if (!acc[key]) acc[key] = [];
          acc[key].push(a);
          return acc;
        }, {})
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${catMeta.bg} ${catMeta.color}`}
              >
                {catMeta.emoji} {catMeta.label}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-gray-800 truncate">
              {event.title}
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
              달성 조건: {conditionLabel} · {event.startDate} ~ {event.endDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold ml-3 flex-shrink-0"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 요약 배너 */}
        {!loading && (
          <div
            className="mx-5 mb-3 rounded-2xl px-4 py-3 flex items-center gap-3 flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
            }}
          >
            <div className="flex-1">
              <p className="text-white/70 text-[11px] font-semibold">달성자</p>
              <p className="text-white text-xl font-extrabold">
                {achievers.length}명
              </p>
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-[11px] font-semibold">
                지급 대기
              </p>
              <p className="text-white text-xl font-extrabold">
                {pendingCount}명
              </p>
            </div>
            {pendingCount > 0 && (
              <button
                onClick={handleGrantAll}
                disabled={grantingId !== null}
                className="flex-shrink-0 bg-white/20 text-white text-xs font-extrabold px-3 py-2 rounded-xl active:scale-95 transition disabled:opacity-50"
                aria-label="전체 보상 지급"
              >
                전체 지급
              </button>
            )}
          </div>
        )}

        {/* 달성자 목록 */}
        <div className="flex-1 overflow-y-auto pb-10">
          {loading ? (
            <div className="flex flex-col gap-3 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 h-4 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="w-16 h-7 bg-gray-100 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          ) : achievers.length === 0 ? (
            <div className="flex flex-col items-center py-14 gap-3 text-gray-300">
              <HiUsers size={40} />
              <p className="text-sm font-bold">달성자가 없어요</p>
              <p className="text-xs text-gray-400 text-center px-8">
                이벤트 조건({conditionLabel})을 충족한 유저가 없습니다
              </p>
            </div>
          ) : grouped ? (
            // 파티 이벤트: 파티별 그룹
            Object.entries(grouped).map(([partyName, members]) => (
              <div key={partyName}>
                <div className="px-5 py-2 bg-blue-50 flex items-center gap-2">
                  <span className="text-xs font-extrabold text-blue-600">
                    🤝 {partyName}
                  </span>
                  <span className="text-[11px] text-blue-400 font-semibold">
                    합산 {members[0].progress.toLocaleString()}보
                  </span>
                </div>
                {members.map((a) => (
                  <AchieverRow
                    key={a.userId}
                    achiever={a}
                    onGrant={() => handleGrant(a)}
                    isGranting={grantingId === a.userId}
                    event={event}
                  />
                ))}
              </div>
            ))
          ) : (
            // 개인/streak 이벤트: 플랫 리스트
            achievers.map((a, i) => (
              <AchieverRow
                key={a.userId}
                achiever={a}
                rank={i + 1}
                onGrant={() => handleGrant(a)}
                isGranting={grantingId === a.userId}
                event={event}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AchieverRow({
  achiever,
  rank,
  onGrant,
  isGranting,
  event,
}: {
  achiever: Achiever;
  rank?: number;
  onGrant: () => void;
  isGranting: boolean;
  event: AppEvent;
}) {
  const progressLabel =
    event.category === "streak"
      ? `${achiever.progress}일 연속`
      : event.conditionType === "avg_steps"
        ? `평균 ${achiever.progress.toLocaleString()}보/일`
        : `${achiever.progress.toLocaleString()}보`;

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0">
      {rank !== undefined && (
        <span className="text-sm font-extrabold text-gray-300 w-5 text-center flex-shrink-0">
          {rank}
        </span>
      )}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-extrabold text-[var(--color-primary)]">
          {achiever.nickname.charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">
          {achiever.nickname}
        </p>
        <p className="text-[11px] text-gray-400 font-semibold">
          {progressLabel}
        </p>
      </div>
      {achiever.alreadyGranted ? (
        <span className="text-[11px] font-extrabold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full flex-shrink-0">
          지급됨
        </span>
      ) : (
        <button
          onClick={onGrant}
          disabled={isGranting}
          className="text-[11px] font-extrabold text-white px-3 py-1.5 rounded-xl active:scale-95 transition disabled:opacity-50 flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          }}
          aria-label="보상 지급"
        >
          {isGranting ? "처리 중…" : "보상 지급"}
        </button>
      )}
    </div>
  );
}

// ── 탭: 이벤트 관리 ───────────────────────────────────────
function EventsTab() {
  const { user } = useUser();
  const {
    events,
    activeEvents,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEvent,
  } = useEvents();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AppEvent | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [achieversEvent, setAchieversEvent] = useState<AppEvent | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  async function handleSave(data: Omit<AppEvent, "id" | "createdAt">) {
    if (editingEvent) {
      await updateEvent(editingEvent.id, data);
    } else {
      await addEvent(data);
    }
    setEditingEvent(undefined);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4 pb-28">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4">
            <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-24 mb-3" />
            <div className="h-5 bg-gray-100 rounded-lg animate-pulse w-40 mb-2" />
            <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 pb-28">
      {/* 상단 바 */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-400">
          전체 {events.length}개
          <span className="ml-2 text-[var(--color-primary)]">
            활성 {activeEvents.length}개
          </span>
        </p>
        <button
          onClick={() => {
            setEditingEvent(undefined);
            setShowForm(true);
          }}
          className="flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-full active:scale-95 transition"
        >
          <HiPlus size={14} />
          이벤트 추가
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 gap-3">
          <HiSpeakerphone size={40} className="text-gray-200" />
          <p className="text-sm font-bold text-gray-400">
            등록된 이벤트가 없어요
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-4 py-2 rounded-full"
          >
            + 첫 이벤트 추가
          </button>
        </div>
      ) : (
        events.map((event) => {
          const catMeta = CATEGORY_META[event.category];
          const status = getEventStatus(event);
          const isExpired = event.endDate < today;

          return (
            <div
              key={event.id}
              className={`bg-white rounded-2xl shadow-sm p-4 transition-all ${
                !event.isActive || isExpired ? "opacity-70" : ""
              }`}
            >
              {/* 배지 행 */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
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
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isExpired ? (
                    // 종료 이벤트: 달성자 확인 버튼
                    <button
                      onClick={() => setAchieversEvent(event)}
                      className="flex items-center gap-1 text-[11px] font-extrabold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-lg active:scale-95 transition"
                      aria-label="달성자 확인"
                    >
                      <HiUsers size={12} />
                      달성자 확인
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleEvent(event.id)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                        event.isActive
                          ? "text-gray-400 bg-gray-100"
                          : "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      }`}
                      aria-label={event.isActive ? "비활성화" : "활성화"}
                    >
                      {event.isActive ? "끄기" : "켜기"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setShowForm(true);
                    }}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-400 transition-colors"
                    aria-label="이벤트 수정"
                  >
                    <HiPencil size={13} />
                  </button>
                  {deletingId === event.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          deleteEvent(event.id);
                          setDeletingId(null);
                        }}
                        className="text-[11px] font-bold text-red-500 px-2 py-1"
                        aria-label="삭제 확인"
                      >
                        삭제
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-[11px] font-bold text-gray-400 px-1 py-1"
                        aria-label="취소"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(event.id)}
                      className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors"
                      aria-label="이벤트 삭제"
                    >
                      <HiTrash size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* 내용 */}
              <p className="font-extrabold text-gray-800 text-sm mb-0.5">
                {event.title}
              </p>
              {event.description && (
                <p className="text-xs text-gray-500 mb-2">
                  {event.description}
                </p>
              )}

              {/* 조건 + 보상 */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                <p className="text-[11px] text-gray-400 font-semibold">
                  🎯 {event.conditionValue.toLocaleString()}
                  {CONDITION_META[event.conditionType].unit}{" "}
                  {CONDITION_META[event.conditionType].label}
                </p>
                <p className="text-[11px] text-gray-400 font-semibold">
                  🎁 {REWARD_TYPE_META[event.reward.type].label}
                  {event.reward.bubbleId
                    ? ` · ${BUBBLE_PREVIEWS[event.reward.bubbleId]?.text ?? event.reward.bubbleId}`
                    : ""}
                  {event.reward.titleText ? ` · ${event.reward.titleText}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold">
                <HiCalendar size={12} />
                <span>
                  {event.startDate} ~ {event.endDate}
                </span>
              </div>
            </div>
          );
        })
      )}

      {showForm && (
        <EventFormSheet
          initial={editingEvent}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingEvent(undefined);
          }}
        />
      )}

      {achieversEvent && user && (
        <AchieversSheet
          event={achieversEvent}
          adminUserId={user.id}
          onClose={() => setAchieversEvent(null)}
        />
      )}
    </div>
  );
}

// ── Admin 메인 ───────────────────────────────────────────
const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "대시보드", icon: <HiChartBar size={15} /> },
  { id: "premium", label: "프리미엄", icon: <HiSparkles size={15} /> },
  { id: "events", label: "이벤트", icon: <HiCalendar size={15} /> },
  { id: "notices", label: "공지사항", icon: <HiSpeakerphone size={15} /> },
];

export default function Admin() {
  const navigate = useNavigate();
  const { stats, subscriberStats, isLoading, refresh } = useAdminStats();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate("/settings")}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 active:scale-95 transition"
            aria-label="뒤로가기"
          >
            <HiArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-gray-800">
              관리자 페이지
            </h1>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 active:scale-95 transition disabled:opacity-40"
            aria-label="새로고침"
          >
            <HiRefresh size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* 탭바 */}
        <div className="flex overflow-x-auto scrollbar-none -mx-1 px-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center justify-center gap-1 py-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-transparent text-gray-400"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "dashboard" && (
          <DashboardTab stats={stats} isLoading={isLoading} />
        )}
        {activeTab === "premium" && (
          <PremiumTab
            subscriberStats={subscriberStats}
            totalUsers={stats?.totalUsers ?? 0}
            isLoading={isLoading}
          />
        )}
        {activeTab === "events" && <EventsTab />}
        {activeTab === "notices" && <NoticesTab />}
      </div>
    </div>
  );
}
