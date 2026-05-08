import { useState, useEffect } from "react";
import { TAGS } from "../data/tags";
import { POINT_RULES } from "../data/points";
import { storage } from "../utils/storage";
import { useUser } from "../context/UserContext";
import { useParty } from "../hooks/useParty";
import { getPartyMembers } from "../lib/partyService";
import type {
  Party as PartyData,
  PartyMember,
  CreatePartyInput,
} from "../lib/partyService";

type TimeSlot = "새벽" | "아침" | "저녁" | "주말";
type DistanceOption = "3km" | "5km" | "10km";
type MaxMembersOption = 5 | 10 | 20;

const timeSlotEmoji: Record<TimeSlot, string> = {
  새벽: "🌅",
  아침: "☀️",
  저녁: "🌙",
  주말: "🏖️",
};

function PartyCard({
  party,
  joined,
  isLeader,
  onRanking,
  onJoin,
  onLeave,
  onDelete,
}: {
  party: PartyData;
  joined: boolean;
  isLeader: boolean;
  onRanking: (p: PartyData) => void;
  onJoin?: (p: PartyData) => void;
  onLeave?: (p: PartyData) => void;
  onDelete?: (p: PartyData) => void;
}) {
  const slotFull = party.member_count >= party.max_members;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-3xl flex-shrink-0">
          {party.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-extrabold text-gray-800 truncate">
              {party.name}
            </p>
            {isLeader && onDelete && (
              <button
                onClick={() => onDelete(party)}
                aria-label="파티 삭제"
                className="flex-shrink-0 w-7 h-7 rounded-full bg-red-50 text-red-400 text-xs font-bold flex items-center justify-center hover:bg-red-100 transition"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            {party.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {party.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-semibold"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2">
          <span className="text-base">👥</span>
          <div>
            <p className="text-[10px] text-gray-400">멤버</p>
            <p className="text-xs font-bold text-gray-700">
              {party.member_count} / {party.max_members}명
            </p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2">
          <span className="text-base">📍</span>
          <div>
            <p className="text-[10px] text-gray-400">목표 거리</p>
            <p className="text-xs font-bold text-gray-700">
              {party.target_distance}
            </p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2">
          <span className="text-base">
            {timeSlotEmoji[party.exercise_time] ?? "⏰"}
          </span>
          <div>
            <p className="text-[10px] text-gray-400">운동 시간대</p>
            <p className="text-xs font-bold text-gray-700">
              {party.exercise_time}
            </p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2">
          <span className="text-base">👑</span>
          <div>
            <p className="text-[10px] text-gray-400">파티장</p>
            <p className="text-xs font-bold text-gray-700 truncate">
              {party.leader_nickname}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onRanking(party)}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
        >
          🏆 랭킹 보기
        </button>
        {joined ? (
          <button
            onClick={() => onLeave?.(party)}
            className="flex-1 py-2.5 rounded-xl bg-green-100 text-xs font-bold text-green-600 active:scale-95 transition"
          >
            ✓ 참여중
          </button>
        ) : (
          <button
            disabled={slotFull}
            onClick={() => !slotFull && onJoin?.(party)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
              slotFull
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-primary text-white active:scale-95"
            }`}
          >
            {slotFull ? "모집 마감" : "참가하기"}
          </button>
        )}
      </div>
    </div>
  );
}

function KickConfirmModal({
  nickname,
  onConfirm,
  onCancel,
}: {
  nickname: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-7 flex flex-col items-center gap-4 shadow-xl">
        <span className="text-5xl">⚠️</span>
        <p className="font-extrabold text-gray-800 text-lg text-center">
          멤버를 강퇴할까요?
        </p>
        <p className="text-sm text-gray-400 text-center">
          <span className="font-bold text-gray-600">"{nickname}"</span> 님을
          파티에서 강퇴해요
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-gray-100 text-sm font-bold text-gray-500 active:scale-95 transition"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-extrabold active:scale-95 transition"
          >
            강퇴
          </button>
        </div>
      </div>
    </div>
  );
}

function RankingModal({
  party,
  isLeader,
  currentUserId,
  onKick,
  onClose,
}: {
  party: PartyData;
  isLeader: boolean;
  currentUserId: string | undefined;
  onKick: (
    partyId: string,
    userId: string,
  ) => Promise<{ error: string | null }>;
  onClose: () => void;
}) {
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [kickTarget, setKickTarget] = useState<PartyMember | null>(null);

  useEffect(() => {
    getPartyMembers(party.id).then((data) => {
      setMembers(data.sort((a, b) => b.weekly_steps - a.weekly_steps));
      setLoading(false);
    });
  }, [party.id]);

  const handleKickConfirm = async () => {
    if (!kickTarget) return;
    await onKick(party.id, kickTarget.user_id);
    const updated = await getPartyMembers(party.id);
    setMembers(updated.sort((a, b) => b.weekly_steps - a.weekly_steps));
    setKickTarget(null);
  };

  const rankEmojis = ["🥇", "🥈", "🥉"];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-10 flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <p className="font-extrabold text-gray-800 text-lg">
              {party.emoji} {party.name} 랭킹
            </p>
            <button
              onClick={onClose}
              className="text-gray-400 text-xl font-bold"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="py-10 flex items-center justify-center">
              <span className="text-gray-300 text-sm animate-pulse">
                불러오는 중...
              </span>
            </div>
          ) : members.length === 0 ? (
            <div className="py-10 flex items-center justify-center">
              <span className="text-gray-300 text-sm">멤버가 없어요</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {members.map((m, i) => (
                <div
                  key={m.user_id}
                  className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3"
                >
                  <span className="text-2xl w-8 text-center flex-shrink-0">
                    {rankEmojis[i] ?? `${i + 1}`}
                  </span>
                  <p className="flex-1 font-bold text-gray-700 text-sm truncate">
                    {m.nickname}
                    {m.user_id === currentUserId && (
                      <span className="ml-1 text-[10px] text-primary">
                        (나)
                      </span>
                    )}
                  </p>
                  <p className="text-xs font-extrabold text-primary flex-shrink-0">
                    {m.weekly_steps.toLocaleString()} 보
                  </p>
                  {isLeader && m.user_id !== currentUserId && (
                    <button
                      onClick={() => setKickTarget(m)}
                      aria-label={`${m.nickname} 강퇴`}
                      className="flex-shrink-0 text-[10px] font-bold text-red-400 bg-red-50 px-2 py-1 rounded-full hover:bg-red-100 transition"
                    >
                      강퇴
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            이번 주 누적 걸음 수 기준
          </p>
        </div>
      </div>

      {kickTarget && (
        <KickConfirmModal
          nickname={kickTarget.nickname}
          onConfirm={handleKickConfirm}
          onCancel={() => setKickTarget(null)}
        />
      )}
    </>
  );
}

function CreatePartyModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: CreatePartyInput) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [distance, setDistance] = useState<DistanceOption>("5km");
  const [timeSlot, setTimeSlot] = useState<TimeSlot>("아침");
  const [maxMembers, setMaxMembers] = useState<MaxMembersOption>(10);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);

    const tags =
      selectedTagIds.length > 0
        ? TAGS.filter((t) => selectedTagIds.includes(t.id)).map((t) => t.name)
        : [timeSlot];

    await onCreate({
      name: name.trim(),
      description: `${timeSlot} ${distance} 함께 달려요!`,
      max_members: maxMembers,
      target_distance: distance,
      exercise_time: timeSlot,
      tags,
    });

    setSubmitting(false);
  };

  const distanceOptions: DistanceOption[] = ["3km", "5km", "10km"];
  const timeSlotOptions: TimeSlot[] = ["새벽", "아침", "저녁", "주말"];
  const maxMembersOptions: MaxMembersOption[] = [5, 10, 20];

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-10 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-gray-800 text-lg">파티 만들기</p>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-gray-400 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500">파티 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예) 새벽 러닝 크루"
            maxLength={20}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 placeholder-gray-300 outline-none focus:border-primary transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500">목표 거리</label>
          <div className="flex gap-2">
            {distanceOptions.map((d) => (
              <button
                key={d}
                onClick={() => setDistance(d)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                  distance === d
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500">운동 시간대</label>
          <div className="flex gap-2">
            {timeSlotOptions.map((t) => (
              <button
                key={t}
                onClick={() => setTimeSlot(t)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                  timeSlot === t
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {timeSlotEmoji[t]} {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500">최대 멤버수</label>
          <div className="flex gap-2">
            {maxMembersOptions.map((m) => (
              <button
                key={m}
                onClick={() => setMaxMembers(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                  maxMembers === m
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {m}명
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500">태그</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedTagIds.includes(tag.id)
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || submitting}
          className={`w-full py-3.5 rounded-2xl text-sm font-extrabold transition active:scale-95 ${
            name.trim() && !submitting
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          {submitting ? "만드는 중..." : "만들기"}
        </button>
      </div>
    </div>
  );
}

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-7 flex flex-col items-center gap-4 shadow-xl">
        <span className="text-5xl">🎉</span>
        <p className="font-extrabold text-gray-800 text-lg text-center">
          파티가 생성됐어요!
        </p>
        <p className="text-sm text-gray-400 text-center">
          내 파티 탭에서 확인할 수 있어요
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-primary text-white text-sm font-extrabold active:scale-95 transition"
        >
          확인
        </button>
      </div>
    </div>
  );
}

function JoinConfirmModal({
  partyName,
  onConfirm,
  onCancel,
}: {
  partyName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-7 flex flex-col items-center gap-4 shadow-xl">
        <span className="text-5xl">🎉</span>
        <p className="font-extrabold text-gray-800 text-lg text-center">
          파티에 참가할까요?
        </p>
        <p className="text-sm text-gray-400 text-center">
          <span className="font-bold text-gray-600">"{partyName}"</span> 파티에
          참가해요
        </p>
        <p
          className="text-sm font-bold text-center"
          style={{ color: "var(--color-primary)" }}
        >
          +{POINT_RULES.PARTY_JOIN}P 적립!
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-gray-100 text-sm font-bold text-gray-500 active:scale-95 transition"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-extrabold active:scale-95 transition"
          >
            참가하기
          </button>
        </div>
      </div>
    </div>
  );
}

function LeaveConfirmModal({
  partyName,
  onConfirm,
  onCancel,
}: {
  partyName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-7 flex flex-col items-center gap-4 shadow-xl">
        <span className="text-5xl">👋</span>
        <p className="font-extrabold text-gray-800 text-lg text-center">
          파티를 나갈까요?
        </p>
        <p className="text-sm text-gray-400 text-center">
          <span className="font-bold text-gray-600">"{partyName}"</span>{" "}
          파티에서 나가게 돼요
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-gray-100 text-sm font-bold text-gray-500 active:scale-95 transition"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-extrabold active:scale-95 transition"
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  partyName,
  onConfirm,
  onCancel,
}: {
  partyName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-7 flex flex-col items-center gap-4 shadow-xl">
        <span className="text-5xl">🗑️</span>
        <p className="font-extrabold text-gray-800 text-lg text-center">
          파티를 삭제할까요?
        </p>
        <p className="text-sm text-gray-400 text-center">
          <span className="font-bold text-gray-600">"{partyName}"</span> 파티가
          목록에서 제거돼요
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-gray-100 text-sm font-bold text-gray-500 active:scale-95 transition"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-extrabold active:scale-95 transition"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

function JoinToast() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-gray-800 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in-down">
        <span>🎉</span>
        <span>파티에 참가했어요! +{POINT_RULES.PARTY_JOIN}P 적립</span>
      </div>
    </div>
  );
}

type Tab = "neighbor" | "mine";

export default function Party() {
  const { user } = useUser();
  const {
    parties,
    myParties,
    isLoading,
    isJoined,
    isLeader,
    createParty,
    joinParty,
    leaveParty,
    kickMember,
    deleteParty,
  } = useParty(user?.id ?? null);

  const [tab, setTab] = useState<Tab>("neighbor");
  const [rankingParty, setRankingParty] = useState<PartyData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PartyData | null>(null);
  const [joinTarget, setJoinTarget] = useState<PartyData | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<PartyData | null>(null);
  const [showJoinToast, setShowJoinToast] = useState(false);
  const [filterTagId, setFilterTagId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreate = async (input: CreatePartyInput) => {
    const { error } = await createParty(input);
    if (!error) {
      setShowCreateModal(false);
      setShowSuccessModal(true);
    }
  };

  const handleJoinConfirm = async () => {
    if (!joinTarget) return;
    const { error } = await joinParty(joinTarget.id);
    if (!error) {
      const today = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const todayStr = `${today.getFullYear()}.${pad(today.getMonth() + 1)}.${pad(today.getDate())}`;
      storage.addPoints(POINT_RULES.PARTY_JOIN);
      storage.addPointsHistory({
        date: todayStr,
        desc: `${joinTarget.name} 파티 참가`,
        points: POINT_RULES.PARTY_JOIN,
        icon: "🎉",
      });
      setShowJoinToast(true);
      setTimeout(() => setShowJoinToast(false), 2500);
    }
    setJoinTarget(null);
  };

  const handleLeaveConfirm = async () => {
    if (!leaveTarget) return;
    await leaveParty(leaveTarget.id);
    setLeaveTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteParty(deleteTarget.id);
    setDeleteTarget(null);
  };

  const filteredParties = parties.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesTag =
      filterTagId === null ||
      (() => {
        const tagName = TAGS.find((t) => t.id === filterTagId)?.name;
        return tagName ? p.tags.includes(tagName) : true;
      })();
    return matchesSearch && matchesTag;
  });

  const list = tab === "neighbor" ? filteredParties : myParties;

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-2xl font-extrabold text-primary">파티</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full active:scale-95 transition"
        >
          + 파티 만들기
        </button>
      </div>

      <div className="mx-4 flex bg-white rounded-2xl shadow-sm p-1">
        {(
          [
            ["neighbor", "동네 파티"],
            ["mine", "내 파티"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === key ? "bg-primary text-white shadow-sm" : "text-gray-400"
            }`}
          >
            {label}
            {key === "mine" && (
              <span className="ml-1.5 text-xs bg-white/30 rounded-full px-1.5">
                {myParties.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "neighbor" && (
        <div className="px-4 mt-3">
          <div className="flex items-center gap-2 bg-white rounded-2xl shadow-sm px-4 py-2.5">
            <span className="text-gray-300 text-base">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="파티 이름 검색"
              className="flex-1 text-sm font-semibold text-gray-700 placeholder-gray-300 outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="검색어 지우기"
                className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs font-bold flex items-center justify-center hover:bg-gray-200 transition"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "neighbor" && (
        <div className="flex gap-2 px-4 mt-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilterTagId(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${
              filterTagId === null
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            전체
          </button>
          {TAGS.map((tag) => (
            <button
              key={tag.id}
              onClick={() =>
                setFilterTagId(filterTagId === tag.id ? null : tag.id)
              }
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                filterTagId === tag.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-20 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-300">
            <span className="text-4xl animate-pulse">🏕️</span>
            <p className="text-sm font-bold">파티를 불러오는 중...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-300">
            <span className="text-5xl">🏕️</span>
            {tab === "neighbor" ? (
              <>
                <p className="font-bold text-sm">조건에 맞는 파티가 없어요</p>
                <p className="text-xs">
                  {searchQuery.trim()
                    ? `"${searchQuery.trim()}" 검색 결과가 없어요`
                    : "다른 태그로 검색해보세요!"}
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-sm">참여중인 파티가 없어요</p>
                <p className="text-xs">
                  동네 파티에서 새로운 파티에 참가해보세요!
                </p>
              </>
            )}
          </div>
        ) : (
          list.map((p) => (
            <PartyCard
              key={p.id}
              party={p}
              joined={isJoined(p.id)}
              isLeader={isLeader(p)}
              onRanking={setRankingParty}
              onJoin={setJoinTarget}
              onLeave={setLeaveTarget}
              onDelete={setDeleteTarget}
            />
          ))
        )}
      </div>

      {rankingParty && (
        <RankingModal
          party={rankingParty}
          isLeader={isLeader(rankingParty)}
          currentUserId={user?.id}
          onKick={kickMember}
          onClose={() => setRankingParty(null)}
        />
      )}
      {showCreateModal && (
        <CreatePartyModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          partyName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {joinTarget && (
        <JoinConfirmModal
          partyName={joinTarget.name}
          onConfirm={handleJoinConfirm}
          onCancel={() => setJoinTarget(null)}
        />
      )}
      {leaveTarget && (
        <LeaveConfirmModal
          partyName={leaveTarget.name}
          onConfirm={handleLeaveConfirm}
          onCancel={() => setLeaveTarget(null)}
        />
      )}
      {showJoinToast && <JoinToast />}
    </div>
  );
}
