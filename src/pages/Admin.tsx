import { useState } from "react";
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
type AdminTab = "dashboard" | "premium" | "events";

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
    if (endDate < startDate) return setError("종료일이 시작일보다 빠를 수 없어요.");
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
                {meta.emoji} {meta.label.replace(" 이벤트", "").replace(" 챌린지", "")}
              </button>
            );
          })}
        </div>

        {/* 제목 */}
        <p className="text-xs font-bold text-gray-400 mb-2">제목</p>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(null); }}
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
            onChange={(e) => { setConditionValue(e.target.value); setError(null); }}
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
              onChange={(e) => { setBubbleId(e.target.value); setError(null); }}
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
              onChange={(e) => { setTitleText(e.target.value); setError(null); }}
              placeholder="예: 🔥 30일 완주자"
              maxLength={20}
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none mb-4 placeholder:text-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
          </>
        )}

        {/* 기간 */}
        <p className="text-xs font-bold text-gray-400 mb-2">이벤트 기간</p>
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

// ── 탭: 이벤트 관리 ───────────────────────────────────────
function EventsTab() {
  const { events, activeEvents, addEvent, updateEvent, deleteEvent, toggleEvent } =
    useEvents();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AppEvent | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleSave(data: Omit<AppEvent, "id" | "createdAt">) {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    } else {
      addEvent(data);
    }
    setEditingEvent(undefined);
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
          onClick={() => { setEditingEvent(undefined); setShowForm(true); }}
          className="flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-full active:scale-95 transition"
        >
          <HiPlus size={14} />
          이벤트 추가
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 gap-3">
          <HiSpeakerphone size={40} className="text-gray-200" />
          <p className="text-sm font-bold text-gray-400">등록된 이벤트가 없어요</p>
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
          const isExpired = event.endDate < new Date().toISOString().slice(0, 10);

          return (
            <div
              key={event.id}
              className={`bg-white rounded-2xl shadow-sm p-4 transition-all ${
                !event.isActive || isExpired ? "opacity-60" : ""
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
                  {!isExpired && (
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
                    onClick={() => { setEditingEvent(event); setShowForm(true); }}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-400 transition-colors"
                    aria-label="이벤트 수정"
                  >
                    <HiPencil size={13} />
                  </button>
                  {deletingId === event.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { deleteEvent(event.id); setDeletingId(null); }}
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
                <p className="text-xs text-gray-500 mb-2">{event.description}</p>
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
          onClose={() => { setShowForm(false); setEditingEvent(undefined); }}
        />
      )}
    </div>
  );
}

// ── Admin 메인 ───────────────────────────────────────────
const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "대시보드", icon: <HiChartBar size={16} /> },
  { id: "premium", label: "프리미엄", icon: <HiSparkles size={16} /> },
  { id: "events", label: "이벤트", icon: <HiSpeakerphone size={16} /> },
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
            <HiRefresh
              size={18}
              className={isLoading ? "animate-spin" : ""}
            />
          </button>
        </div>

        {/* 탭바 */}
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold border-b-2 transition-colors ${
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
      </div>
    </div>
  );
}
