import { useState } from "react";
import { TAGS } from "../data/tags";
import { storage } from "../utils/storage";

type TimeSlot = "새벽" | "아침" | "저녁" | "주말";
type DistanceOption = "3km" | "5km" | "10km";
type MaxMembersOption = 5 | 10 | 20;

interface PartyMember {
  nickname: string;
  emoji: string;
  steps: number;
}

interface Party {
  id: number;
  name: string;
  emoji: string;
  description: string;
  leader: string;
  members: number;
  maxMembers: number;
  distance: string;
  timeSlot: TimeSlot;
  tags: string[];
  topMembers: PartyMember[];
}

const timeSlotEmoji: Record<TimeSlot, string> = {
  새벽: "🌅",
  아침: "☀️",
  저녁: "🌙",
  주말: "🏖️",
};

const neighborParties: Party[] = [
  {
    id: 1,
    name: "새벽 러닝 크루",
    emoji: "🏃",
    description: "매일 새벽 5시, 한강변에서 함께 달려요!",
    leader: "빠른발_준혁",
    members: 12,
    maxMembers: 20,
    distance: "5km",
    timeSlot: "새벽",
    tags: ["러닝", "한강", "유산소"],
    topMembers: [
      { nickname: "빠른발_준혁", emoji: "🥇", steps: 18420 },
      { nickname: "달리기_수아", emoji: "🥈", steps: 16300 },
      { nickname: "새벽형_민준", emoji: "🥉", steps: 14890 },
    ],
  },
  {
    id: 2,
    name: "주말 등산 모임",
    emoji: "⛰️",
    description: "매주 토요일 북한산 정상 정복! 초보도 환영",
    leader: "등산왕_철수",
    members: 8,
    maxMembers: 15,
    distance: "10km",
    timeSlot: "주말",
    tags: ["등산", "북한산", "자연"],
    topMembers: [
      { nickname: "등산왕_철수", emoji: "🥇", steps: 22100 },
      { nickname: "정상러_영희", emoji: "🥈", steps: 19500 },
      { nickname: "힐링하이커", emoji: "🥉", steps: 17200 },
    ],
  },
  {
    id: 3,
    name: "저녁 산책 파티",
    emoji: "🌙",
    description: "퇴근 후 동네 한 바퀴, 스트레스 날려요 🌙",
    leader: "산책왕_도현",
    members: 5,
    maxMembers: 10,
    distance: "3km",
    timeSlot: "저녁",
    tags: ["산책", "힐링", "초보환영"],
    topMembers: [
      { nickname: "산책왕_도현", emoji: "🥇", steps: 9800 },
      { nickname: "저녁걷기", emoji: "🥈", steps: 8400 },
      { nickname: "퇴근러너", emoji: "🥉", steps: 7600 },
    ],
  },
  {
    id: 4,
    name: "아침 요가 & 걷기",
    emoji: "🧘",
    description: "요가 30분 + 공원 걷기 1시간, 몸과 마음 함께 건강하게",
    leader: "요가마스터_소연",
    members: 9,
    maxMembers: 12,
    distance: "4km",
    timeSlot: "아침",
    tags: ["요가", "걷기", "힐링"],
    topMembers: [
      { nickname: "요가마스터_소연", emoji: "🥇", steps: 11200 },
      { nickname: "아침형인간", emoji: "🥈", steps: 9900 },
      { nickname: "공원산책러", emoji: "🥉", steps: 8700 },
    ],
  },
];

const neighborPartyIds = new Set(neighborParties.map((p) => p.id));

const partyEmojis = ["🏃", "⛰️", "🌙", "🧘", "🚴", "🏊", "⚽", "🎯"];

function PartyCard({
  party,
  joined,
  memberCount,
  onRanking,
  onJoin,
  onLeave,
  onDelete,
}: {
  party: Party;
  joined: boolean;
  memberCount: number;
  onRanking: (p: Party) => void;
  onJoin?: (p: Party) => void;
  onLeave?: (p: Party) => void;
  onDelete?: (p: Party) => void;
}) {
  const slotFull = memberCount >= party.maxMembers;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-3xl flex-shrink-0">
          {party.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-extrabold text-gray-800 truncate">{party.name}</p>
            {onDelete && (
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
              {memberCount} / {party.maxMembers}명
            </p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2">
          <span className="text-base">📍</span>
          <div>
            <p className="text-[10px] text-gray-400">목표 거리</p>
            <p className="text-xs font-bold text-gray-700">{party.distance}</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2">
          <span className="text-base">{timeSlotEmoji[party.timeSlot]}</span>
          <div>
            <p className="text-[10px] text-gray-400">운동 시간대</p>
            <p className="text-xs font-bold text-gray-700">{party.timeSlot}</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2">
          <span className="text-base">👑</span>
          <div>
            <p className="text-[10px] text-gray-400">파티장</p>
            <p className="text-xs font-bold text-gray-700 truncate">
              {party.leader}
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

function RankingModal({
  party,
  onClose,
}: {
  party: Party;
  onClose: () => void;
}) {
  return (
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
          <button onClick={onClose} className="text-gray-400 text-xl font-bold" aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {party.topMembers.map((m) => (
            <div
              key={m.nickname}
              className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3"
            >
              <span className="text-2xl w-8 text-center">{m.emoji}</span>
              <p className="flex-1 font-bold text-gray-700 text-sm">
                {m.nickname}
              </p>
              <p className="text-xs font-extrabold text-primary">
                {m.steps.toLocaleString()} 보
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">
          이번 주 누적 걸음 수 기준
        </p>
      </div>
    </div>
  );
}

function CreatePartyModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (party: Party) => void;
}) {
  const [name, setName] = useState("");
  const [distance, setDistance] = useState<DistanceOption>("5km");
  const [timeSlot, setTimeSlot] = useState<TimeSlot>("아침");
  const [maxMembers, setMaxMembers] = useState<MaxMembersOption>(10);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const tags = selectedTagIds.length > 0
      ? TAGS.filter((t) => selectedTagIds.includes(t.id)).map((t) => t.name)
      : [timeSlot];

    const randomEmoji = partyEmojis[Math.floor(Math.random() * partyEmojis.length)];
    const newParty: Party = {
      id: Date.now(),
      name: name.trim(),
      emoji: randomEmoji,
      description: `${timeSlot} ${distance} 함께 달려요!`,
      leader: "나",
      members: 1,
      maxMembers,
      distance,
      timeSlot,
      tags,
      topMembers: [],
    };
    onCreate(newParty);
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
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-gray-800 text-lg">파티 만들기</p>
          <button onClick={onClose} aria-label="닫기" className="text-gray-400 text-xl font-bold">
            ✕
          </button>
        </div>

        {/* 파티 이름 */}
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

        {/* 목표 거리 */}
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

        {/* 운동 시간대 */}
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

        {/* 최대 멤버수 */}
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

        {/* 태그 */}
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

        {/* 만들기 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className={`w-full py-3.5 rounded-2xl text-sm font-extrabold transition active:scale-95 ${
            name.trim()
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          만들기
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
          <span className="font-bold text-gray-600">"{partyName}"</span> 파티에서
          나가게 돼요
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

function JoinToast() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-gray-800 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in-down">
        <span>🎉</span>
        <span>파티에 참가했어요!</span>
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

type Tab = "neighbor" | "mine";

export default function Party() {
  const [tab, setTab] = useState<Tab>("neighbor");
  const [rankingParty, setRankingParty] = useState<Party | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Party | null>(null);
  const [userCreatedParties, setUserCreatedParties] = useState<Party[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(
    () => new Set(storage.getJoinedPartyIds())
  );
  const [joinTarget, setJoinTarget] = useState<Party | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<Party | null>(null);
  const [showJoinToast, setShowJoinToast] = useState(false);
  const [filterTagId, setFilterTagId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const myParties = [
    ...neighborParties.filter((p) => joinedIds.has(p.id)),
    ...userCreatedParties,
  ];
  const myPartyIds = new Set(myParties.map((p) => p.id));

  const getMemberCount = (party: Party) =>
    neighborPartyIds.has(party.id)
      ? party.members + (joinedIds.has(party.id) ? 1 : 0)
      : party.members;

  const handleJoinConfirm = () => {
    if (!joinTarget) return;
    const newIds = new Set(joinedIds);
    newIds.add(joinTarget.id);
    setJoinedIds(newIds);
    storage.setJoinedPartyIds([...newIds]);
    setJoinTarget(null);
    setShowJoinToast(true);
    setTimeout(() => setShowJoinToast(false), 2500);
  };

  const handleLeaveConfirm = () => {
    if (!leaveTarget) return;
    const newIds = new Set(joinedIds);
    newIds.delete(leaveTarget.id);
    setJoinedIds(newIds);
    storage.setJoinedPartyIds([...newIds]);
    setLeaveTarget(null);
  };

  const filteredNeighbor = neighborParties.filter((p) => {
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

  const list = tab === "neighbor" ? filteredNeighbor : myParties;

  const handleCreate = (party: Party) => {
    setUserCreatedParties((prev) => [party, ...prev]);
    setShowCreateModal(false);
    setShowSuccessModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setUserCreatedParties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-2xl font-extrabold text-primary">파티</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full active:scale-95 transition"
        >
          + 파티 만들기
        </button>
      </div>

      {/* 탭 */}
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

      {/* 검색창 (동네 파티 탭에서만) */}
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

      {/* 태그 필터 (동네 파티 탭에서만) */}
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
              onClick={() => setFilterTagId(filterTagId === tag.id ? null : tag.id)}
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

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-20 flex flex-col gap-4">
        {list.length === 0 ? (
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
                <p className="text-xs">동네 파티에서 새로운 파티에 참가해보세요!</p>
              </>
            )}
          </div>
        ) : (
          list.map((p) => (
            <PartyCard
              key={p.id}
              party={p}
              joined={myPartyIds.has(p.id)}
              memberCount={getMemberCount(p)}
              onRanking={setRankingParty}
              onJoin={setJoinTarget}
              onLeave={setLeaveTarget}
              onDelete={
                tab === "mine" && !neighborPartyIds.has(p.id)
                  ? setDeleteTarget
                  : undefined
              }
            />
          ))
        )}
      </div>

      {/* 랭킹 모달 */}
      {rankingParty && (
        <RankingModal
          party={rankingParty}
          onClose={() => setRankingParty(null)}
        />
      )}

      {/* 파티 만들기 모달 */}
      {showCreateModal && (
        <CreatePartyModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {/* 생성 완료 모달 */}
      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} />
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <DeleteConfirmModal
          partyName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* 참가 확인 모달 */}
      {joinTarget && (
        <JoinConfirmModal
          partyName={joinTarget.name}
          onConfirm={handleJoinConfirm}
          onCancel={() => setJoinTarget(null)}
        />
      )}

      {/* 나가기 확인 모달 */}
      {leaveTarget && (
        <LeaveConfirmModal
          partyName={leaveTarget.name}
          onConfirm={handleLeaveConfirm}
          onCancel={() => setLeaveTarget(null)}
        />
      )}

      {/* 참가 완료 토스트 */}
      {showJoinToast && <JoinToast />}
    </div>
  );
}
