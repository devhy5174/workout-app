import { useState } from "react";

type TimeSlot = "새벽" | "아침" | "저녁" | "주말";

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

const myParties: Party[] = [
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
];

function PartyCard({
  party,
  joined,
  onRanking,
}: {
  party: Party;
  joined: boolean;
  onRanking: (p: Party) => void;
}) {
  const slotFull = party.members >= party.maxMembers;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      {/* 상단: 이모지 + 기본 정보 */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-3xl flex-shrink-0">
          {party.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-gray-800">{party.name}</p>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{party.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {party.tags.map((t) => (
              <span key={t} className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-semibold">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2">
          <span className="text-base">👥</span>
          <div>
            <p className="text-[10px] text-gray-400">멤버</p>
            <p className="text-xs font-bold text-gray-700">
              {party.members} / {party.maxMembers}명
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
            <p className="text-xs font-bold text-gray-700 truncate">{party.leader}</p>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={() => onRanking(party)}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
        >
          🏆 랭킹 보기
        </button>
        {joined ? (
          <button className="flex-1 py-2.5 rounded-xl bg-gray-100 text-xs font-bold text-gray-400">
            ✓ 참여중
          </button>
        ) : (
          <button
            disabled={slotFull}
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

function RankingModal({ party, onClose }: { party: Party; onClose: () => void }) {
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
          <button onClick={onClose} className="text-gray-400 text-xl font-bold">✕</button>
        </div>
        <div className="flex flex-col gap-3">
          {party.topMembers.map((m, i) => (
            <div key={m.nickname} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
              <span className="text-2xl w-8 text-center">{m.emoji}</span>
              <p className="flex-1 font-bold text-gray-700 text-sm">{m.nickname}</p>
              <p className="text-xs font-extrabold text-primary">
                {m.steps.toLocaleString()} 보
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">이번 주 누적 걸음 수 기준</p>
      </div>
    </div>
  );
}

type Tab = "neighbor" | "mine";

export default function Party() {
  const [tab, setTab] = useState<Tab>("neighbor");
  const [rankingParty, setRankingParty] = useState<Party | null>(null);

  const myPartyIds = new Set(myParties.map((p) => p.id));
  const list = tab === "neighbor" ? neighborParties : myParties;

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-2xl font-extrabold text-primary">파티</h2>
        <button className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full active:scale-95 transition">
          + 파티 만들기
        </button>
      </div>

      {/* 탭 */}
      <div className="mx-4 flex bg-white rounded-2xl shadow-sm p-1">
        {([["neighbor", "동네 파티"], ["mine", "내 파티"]] as const).map(([key, label]) => (
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

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-20 flex flex-col gap-4">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-300">
            <span className="text-5xl">🏕️</span>
            <p className="font-bold text-sm">참여중인 파티가 없어요</p>
            <p className="text-xs">동네 파티에서 새로운 파티에 참가해보세요!</p>
          </div>
        ) : (
          list.map((p) => (
            <PartyCard
              key={p.id}
              party={p}
              joined={myPartyIds.has(p.id)}
              onRanking={setRankingParty}
            />
          ))
        )}
      </div>

      {/* 랭킹 모달 */}
      {rankingParty && (
        <RankingModal party={rankingParty} onClose={() => setRankingParty(null)} />
      )}
    </div>
  );
}
