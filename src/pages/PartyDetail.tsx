import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useParty } from "../hooks/useParty";
import {
  getPartyById,
  getPartyMembers,
  getPartyTodayStats,
} from "../lib/partyService";
import type {
  Party,
  PartyMember,
  PartyTodayStats,
} from "../lib/partyService";
import { POINT_RULES } from "../data/points";
import { storage } from "../utils/storage";

const timeSlotEmoji: Record<string, string> = {
  새벽: "🌅",
  아침: "☀️",
  저녁: "🌙",
  주말: "🏖️",
};

const rankEmojis = ["🥇", "🥈", "🥉"];

function MemberAvatar({
  image,
  fallback,
}: {
  image: string | null;
  fallback: string;
}) {
  return (
    <span className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
      {image ? (
        <img
          src={image}
          alt=""
          className="w-9 h-9 object-contain"
          draggable={false}
        />
      ) : (
        <span className="text-xl">{fallback}</span>
      )}
    </span>
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
          정말 퇴장시킬까요?
        </p>
        <p className="text-sm text-gray-400 text-center">
          <span className="font-bold text-gray-600">"{nickname}"</span> 님을
          파티에서 퇴장시켜요
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
            퇴장
          </button>
        </div>
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

function Toast({ message, icon = "🎉" }: { message: string; icon?: string }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-gray-800 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2">
        <span>{icon}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}

export default function PartyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { isJoined, isLeader, joinParty, leaveParty, kickMember } = useParty(
    user?.id ?? null,
  );

  const [party, setParty] = useState<Party | null>(null);
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [todayStats, setTodayStats] = useState<PartyTodayStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [kickTarget, setKickTarget] = useState<PartyMember | null>(null);
  const [toast, setToast] = useState<{ message: string; icon?: string } | null>(
    null,
  );

  const showToast = (message: string, icon?: string) => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 2500);
  };

  const reloadMembers = async () => {
    if (!id) return;
    const [m, s] = await Promise.all([
      getPartyMembers(id),
      getPartyTodayStats(id),
    ]);
    setMembers(m.sort((a, b) => b.weekly_steps - a.weekly_steps));
    setTodayStats(s);
  };

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([
      getPartyById(id),
      getPartyMembers(id),
      getPartyTodayStats(id),
    ]).then(([p, m, s]) => {
      setParty(p);
      setMembers(m.sort((a, b) => b.weekly_steps - a.weekly_steps));
      setTodayStats(s);
      setIsLoading(false);
    });
  }, [id]);

  const handleJoinConfirm = async () => {
    if (!party) return;
    const { error } = await joinParty(party.id);
    setShowJoinModal(false);
    if (!error) {
      const today = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const todayStr = `${today.getFullYear()}.${pad(today.getMonth() + 1)}.${pad(today.getDate())}`;
      storage.addPoints(POINT_RULES.PARTY_JOIN);
      storage.addPointsHistory({
        date: todayStr,
        desc: `${party.name} 파티 참가`,
        points: POINT_RULES.PARTY_JOIN,
        icon: "🎉",
      });
      showToast(`파티에 참가했어요! +${POINT_RULES.PARTY_JOIN}P 적립`, "🎉");
      await reloadMembers();
    }
  };

  const handleLeaveConfirm = async () => {
    if (!party) return;
    await leaveParty(party.id);
    setShowLeaveModal(false);
    showToast("파티에서 나왔어요", "👋");
    await reloadMembers();
  };

  const handleKickConfirm = async () => {
    if (!kickTarget || !party) return;
    await kickMember(party.id, kickTarget.user_id);
    setKickTarget(null);
    await reloadMembers();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-bg items-center justify-center gap-3 text-gray-300">
        <span className="text-4xl animate-pulse">🏕️</span>
        <p className="text-sm font-bold">불러오는 중...</p>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="flex flex-col h-full bg-bg items-center justify-center gap-3 text-gray-300">
        <span className="text-5xl">😅</span>
        <p className="text-sm font-bold">파티를 찾을 수 없어요</p>
        <button
          onClick={() => navigate("/party")}
          className="mt-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-sm font-bold"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const joined = isJoined(party.id);
  const leader = isLeader(party);
  const slotFull = party.member_count >= party.max_members;

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-500 text-lg active:scale-95 transition"
        >
          ←
        </button>
        <h2 className="text-lg font-extrabold text-gray-800 truncate flex-1">
          {party.emoji} {party.name}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28 flex flex-col gap-4">
        {/* 파티 기본 정보 */}
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-4xl flex-shrink-0">
              {party.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-800 text-lg">{party.name}</p>
              <p className="text-sm text-gray-400 mt-0.5">{party.description}</p>
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
                  {party.target_distance}km
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
        </div>

        {/* 오늘 파티 현황 */}
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-2">
          <p className="text-sm font-extrabold text-orange-400">🔥 오늘 파티 현황</p>
          {todayStats === null ? (
            <p className="text-xs text-gray-300 animate-pulse">불러오는 중...</p>
          ) : todayStats.totalSteps === 0 ? (
            <p className="text-xs text-gray-400">아직 오늘 운동 기록이 없어요</p>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-gray-700">
                총 걸음수{" "}
                <span className="text-orange-500">
                  {todayStats.totalSteps.toLocaleString()} 보
                </span>
              </p>
              {todayStats.topMember && (
                <p className="text-xs text-gray-400">
                  오늘의 MVP:{" "}
                  <span className="font-bold text-gray-600">
                    {todayStats.topMember.nickname}
                  </span>{" "}
                  ({todayStats.topMember.steps.toLocaleString()} 보)
                </p>
              )}
            </div>
          )}
        </div>

        {/* 멤버 랭킹 */}
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
          <p className="text-sm font-extrabold text-gray-700">
            🏆 이번 주 랭킹
          </p>
          {members.length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-4">멤버가 없어요</p>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map((m, i) => (
                <div
                  key={m.user_id}
                  className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3"
                >
                  <span className="text-xl w-7 text-center flex-shrink-0">
                    {rankEmojis[i] ?? `${i + 1}`}
                  </span>
                  <MemberAvatar
                    image={m.character_image}
                    fallback={m.character_emoji}
                  />
                  <p className="flex-1 font-bold text-gray-700 text-sm truncate">
                    {m.nickname}
                    {m.user_id === user?.id && (
                      <span className="ml-1 text-[10px] text-primary">(나)</span>
                    )}
                  </p>
                  <p className="text-xs font-extrabold text-primary flex-shrink-0">
                    {m.weekly_steps.toLocaleString()} 보
                  </p>
                  {leader && m.user_id !== user?.id && (
                    <button
                      onClick={() => setKickTarget(m)}
                      aria-label={`${m.nickname} 퇴장`}
                      className="flex-shrink-0 text-[10px] font-bold text-red-400 bg-red-50 px-2 py-1 rounded-full hover:bg-red-100 transition"
                    >
                      퇴장
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-400 text-center">이번 주 누적 걸음 수 기준</p>
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="absolute bottom-16 left-0 right-0 max-w-md mx-auto px-4 pb-4">
        <div className="bg-white rounded-3xl shadow-lg p-3 flex gap-2">
          {joined ? (
            leader ? (
              <div className="flex-1 py-3 rounded-2xl bg-yellow-50 text-sm font-extrabold text-yellow-600 flex items-center justify-center gap-1">
                👑 파티장
              </div>
            ) : (
              <button
                onClick={() => setShowLeaveModal(true)}
                className="flex-1 py-3 rounded-2xl bg-red-50 text-sm font-bold text-red-400 active:scale-95 transition"
              >
                👋 파티 나가기
              </button>
            )
          ) : (
            <button
              disabled={slotFull}
              onClick={() => !slotFull && setShowJoinModal(true)}
              className={`flex-1 py-3 rounded-2xl text-sm font-extrabold transition active:scale-95 ${
                slotFull
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-primary text-white"
              }`}
            >
              {slotFull ? "모집 마감" : "🎉 참가하기"}
            </button>
          )}
        </div>
      </div>

      {showJoinModal && (
        <JoinConfirmModal
          partyName={party.name}
          onConfirm={handleJoinConfirm}
          onCancel={() => setShowJoinModal(false)}
        />
      )}
      {showLeaveModal && (
        <LeaveConfirmModal
          partyName={party.name}
          onConfirm={handleLeaveConfirm}
          onCancel={() => setShowLeaveModal(false)}
        />
      )}
      {kickTarget && (
        <KickConfirmModal
          nickname={kickTarget.nickname}
          onConfirm={handleKickConfirm}
          onCancel={() => setKickTarget(null)}
        />
      )}
      {toast && <Toast message={toast.message} icon={toast.icon} />}
    </div>
  );
}
