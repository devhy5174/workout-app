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

// ── 이벤트 타입 ──────────────────────────────────────────
type EventType = "challenge" | "promotion" | "notice" | "maintenance";
type AppEvent = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: EventType;
  isActive: boolean;
};

const EVENT_TYPE_META: Record<
  EventType,
  { label: string; color: string; bg: string }
> = {
  challenge: { label: "챌린지", color: "text-orange-600", bg: "bg-orange-50" },
  promotion: { label: "프로모션", color: "text-blue-600", bg: "bg-blue-50" },
  notice: { label: "공지", color: "text-gray-600", bg: "bg-gray-100" },
  maintenance: {
    label: "점검",
    color: "text-red-600",
    bg: "bg-red-50",
  },
};

const INITIAL_EVENTS: AppEvent[] = [
  {
    id: "1",
    title: "5월 걷기 챌린지",
    description: "5월 한 달간 매일 8,000보 달성하면 특별 보상!",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    type: "challenge",
    isActive: true,
  },
  {
    id: "2",
    title: "신규 가입 포인트 2배",
    description: "5월 신규 가입자 첫 운동 포인트 2배 지급",
    startDate: "2026-05-01",
    endDate: "2026-05-20",
    type: "promotion",
    isActive: true,
  },
];

// ── 이벤트 추가/수정 시트 ────────────────────────────────
function EventFormSheet({
  initial,
  onSave,
  onClose,
}: {
  initial?: AppEvent;
  onSave: (event: Omit<AppEvent, "id">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startDate, setStartDate] = useState(
    initial?.startDate ?? new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState(
    initial?.endDate ?? new Date().toISOString().slice(0, 10),
  );
  const [type, setType] = useState<EventType>(initial?.type ?? "challenge");
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!title.trim()) {
      setError("이벤트 제목을 입력해주세요.");
      return;
    }
    if (endDate < startDate) {
      setError("종료일이 시작일보다 빠를 수 없어요.");
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate,
      type,
      isActive: initial?.isActive ?? true,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 pb-10 shadow-2xl max-h-[90vh] overflow-y-auto"
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

        {/* 타입 선택 */}
        <p className="text-xs font-bold text-gray-400 mb-2">이벤트 유형</p>
        <div className="flex gap-2 mb-4">
          {(Object.keys(EVENT_TYPE_META) as EventType[]).map((t) => {
            const meta = EVENT_TYPE_META[t];
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                  type === t
                    ? `${meta.bg} ${meta.color} border-current`
                    : "bg-gray-50 text-gray-400 border-transparent"
                }`}
              >
                {meta.label}
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
        <p className="text-xs font-bold text-gray-400 mb-2">설명</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="이벤트 설명 (선택)"
          maxLength={100}
          rows={2}
          className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-700 outline-none mb-4 resize-none placeholder:text-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]/30"
        />

        {/* 기간 */}
        <p className="text-xs font-bold text-gray-400 mb-2">기간</p>
        <div className="flex gap-2 mb-4">
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
          disabled={!title.trim()}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition shadow-md disabled:opacity-50"
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

// ── 통계 카드 ────────────────────────────────────────────
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
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
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

// ── 구독자 현황 섹션 ─────────────────────────────────────
function SubscriberSection({
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
      ? Math.round(((subscriberStats?.activeStreakUsers ?? 0) / totalUsers) * 100)
      : 0;

  return (
    <section>
      <p className="text-xs font-bold text-gray-400 px-1 mb-2">구독자 현황</p>

      {/* 습관 달성 지표 2종 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
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
        className="rounded-2xl px-5 py-4 flex items-center gap-4 mb-3"
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
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-3">
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
              <HiBadgeCheck size={16} className="text-[var(--color-primary)] flex-shrink-0" />
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
    </section>
  );
}

// ── Admin 메인 ───────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const { stats, subscriberStats, isLoading, refresh } = useAdminStats();

  const [events, setEvents] = useState<AppEvent[]>(INITIAL_EVENTS);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AppEvent | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAddEvent(data: Omit<AppEvent, "id">) {
    setEvents((prev) => [
      { ...data, id: Date.now().toString() },
      ...prev,
    ]);
  }

  function handleEditEvent(data: Omit<AppEvent, "id">) {
    if (!editingEvent) return;
    setEvents((prev) =>
      prev.map((e) =>
        e.id === editingEvent.id ? { ...data, id: editingEvent.id } : e,
      ),
    );
    setEditingEvent(undefined);
  }

  function handleToggleActive(id: string) {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e)),
    );
  }

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  }

  const today = new Date().toISOString().slice(0, 10);
  const activeEvents = events.filter(
    (e) => e.isActive && e.startDate <= today && e.endDate >= today,
  );

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/settings")}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 active:scale-95 transition"
          aria-label="뒤로가기"
        >
          <HiArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-gray-800">관리자 페이지</h1>
          <p className="text-xs text-gray-400">서비스 현황 및 이벤트 관리</p>
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

      <div className="flex flex-col gap-5 p-4 pb-28">
        {/* 주요 지표 */}
        <section>
          <p className="text-xs font-bold text-gray-400 px-1 mb-2">
            주요 지표
          </p>
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

          {/* 오늘 요약 배너 */}
          <div
            className="mt-3 rounded-2xl px-5 py-4 flex items-center gap-3"
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
        </section>

        {/* 구독자 현황 */}
        <SubscriberSection
          subscriberStats={subscriberStats}
          totalUsers={stats?.totalUsers ?? 0}
          isLoading={isLoading}
        />

        {/* 이벤트 관리 */}
        <section>
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-xs font-bold text-gray-400">
              이벤트 관리
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
            <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-12 gap-3">
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
            <div className="flex flex-col gap-3">
              {events.map((event) => {
                const meta = EVENT_TYPE_META[event.type];
                const isExpired = event.endDate < today;
                const isPending = event.startDate > today;
                const statusLabel = isExpired
                  ? "종료"
                  : isPending
                    ? "예정"
                    : event.isActive
                      ? "진행 중"
                      : "비활성";
                const statusColor = isExpired
                  ? "text-gray-400 bg-gray-100"
                  : isPending
                    ? "text-blue-500 bg-blue-50"
                    : event.isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-gray-400 bg-gray-100";

                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-2xl shadow-sm p-4 transition-all ${
                      !event.isActive || isExpired ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!isExpired && (
                          <button
                            onClick={() => handleToggleActive(event.id)}
                            className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                              event.isActive
                                ? "text-gray-400 bg-gray-100 hover:bg-gray-200"
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
                              onClick={() => handleDelete(event.id)}
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

                    <p className="font-extrabold text-gray-800 text-sm mb-0.5">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-gray-500 mb-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold">
                      <HiCalendar size={12} />
                      <span>
                        {event.startDate} ~ {event.endDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 이벤트 폼 시트 */}
      {showForm && (
        <EventFormSheet
          initial={editingEvent}
          onSave={editingEvent ? handleEditEvent : handleAddEvent}
          onClose={() => {
            setShowForm(false);
            setEditingEvent(undefined);
          }}
        />
      )}
    </div>
  );
}
