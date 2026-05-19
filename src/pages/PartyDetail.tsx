import { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useActiveBubble } from "../context/ActiveBubbleContext";
import { resolveBubblePreview } from "../data/bubblePreviews";
import { validatePostText } from "../data/nicknameFilters";
import { useParty } from "../hooks/useParty";
import {
  getPartyById,
  getPartyMembers,
  getPartyTodayStats,
  getPartyCheers,
  sendPartyCheer,
  getPartyNotices,
  sendPartyNotice,
  deletePartyNotice,
  deleteParty,
  leavePartyAsLeader,
} from "../lib/partyService";
import type {
  Party,
  PartyMember,
  PartyTodayStats,
  PartyNotice,
} from "../lib/partyService";
import { supabase } from "../lib/supabase";

const timeSlotEmoji: Record<string, string> = {
  새벽: "🌅",
  아침: "☀️",
  저녁: "🌙",
  주말: "🏖️",
};

function isInactive7Days(member: PartyMember): boolean {
  // 운동 기록 없으면 가입일 기준으로 판단 (가입 7일 이내면 비활동 아님)
  const referenceDate = member.last_active_at ?? member.joined_at;
  if (!referenceDate) return true;

  const lastDate = new Date(referenceDate);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  return lastDate < sevenDaysAgo;
}

function MemberActivityCard({
  member,
  isMe,
  isPartyLeader,
  canKickInactive,
  onKick,
  activeBubbleId,
}: {
  member: PartyMember;
  isMe: boolean;
  isPartyLeader: boolean;
  canKickInactive: boolean;
  onKick: () => void;
  activeBubbleId: string | null;
}) {
  const {
    is_active,
    character_image,
    character_emoji,
    nickname,
    title,
    today_steps,
  } = member;
  const inactive7 = isInactive7Days(member);
  const bubble = resolveBubblePreview(activeBubbleId);

  return (
    <div
      className={`flex flex-col items-center gap-1 ${canKickInactive && inactive7 ? "cursor-pointer" : ""}`}
      onClick={canKickInactive && inactive7 ? onKick : undefined}
    >
      {/* 상태 표시 (고정 높이) */}
      <div className="h-5 flex items-end justify-center">
        {is_active ? (
          <div className="flex flex-col items-center">
            <span
              className={`relative z-10 ${bubble.colorClass} ${bubble.premium ? "animate-premium-bubble" : ""} ${bubble.darkText ? "text-stone-800" : "text-white"} text-[7px] font-extrabold px-1.5 py-0.5 rounded-full whitespace-nowrap`}
            >
              {bubble.text}
            </span>
            <div
              className={`w-1.5 h-1.5 ${bubble.colorClass} ${bubble.premium ? "animate-premium-bubble" : ""} rotate-45 rounded-[1px] -mt-1`}
            />
          </div>
        ) : (
          <p
            className={`text-[7px] font-extrabold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
              inactive7
                ? "bg-gray-100 text-gray-300"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {inactive7 ? "7일 비활동" : "쉬는 중"}
          </p>
        )}
      </div>
      {/* 캐릭터 이미지 */}
      <div className="relative">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${
            inactive7
              ? "bg-gray-100"
              : is_active
                ? "bg-primary-light"
                : "bg-gray-100 grayscale opacity-40"
          }`}
        >
          {inactive7 ? (
            <FaUser className="text-gray-300 text-3xl" />
          ) : character_image ? (
            <img
              src={character_image}
              alt={nickname}
              className="w-full h-full object-contain"
              draggable={false}
            />
          ) : (
            <span className="text-2xl">{character_emoji}</span>
          )}
        </div>
        {is_active && !inactive7 && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </div>

      {/* 닉네임 */}
      <p
        className={`text-[10px] font-bold text-center w-full truncate leading-tight ${
          isMe ? "text-primary" : inactive7 ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {title ? `${title.split(" ")[0]} ` : ""}
        {nickname.length > 5 ? `${nickname.slice(0, 5)}…` : nickname}
        {isPartyLeader ? "👑" : ""}
      </p>

      {/* 걸음수 (고정 높이) */}
      <div className="h-4 flex items-center justify-center">
        {!inactive7 && (
          <p
            className={`text-[9px] font-bold ${is_active ? "text-emerald-500" : "text-gray-400"}`}
          >
            {today_steps.toLocaleString()}보
          </p>
        )}
      </div>
    </div>
  );
}

type CheerMessage = {
  id: string;
  nickname: string;
  text: string;
};

function CheerTicker({ messages }: { messages: CheerMessage[] }) {
  const [currIndex, setCurrIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const currIndexRef = useRef(0);
  const msgLenRef = useRef(messages.length);

  useEffect(() => {
    currIndexRef.current = currIndex;
  }, [currIndex]);

  useEffect(() => {
    msgLenRef.current = messages.length;
    if (messages.length > 0 && currIndex >= messages.length) {
      setCurrIndex(0);
      currIndexRef.current = 0;
    }
  }, [messages.length, currIndex]);

  useEffect(() => {
    if (messages.length <= 1) return;
    const t = setInterval(() => setTransitioning(true), 3500);
    return () => clearInterval(t);
  }, [messages.length]);

  const handleEnterEnd = () => {
    const len = msgLenRef.current;
    if (len === 0) return;
    const next = (currIndexRef.current + 1) % len;
    setCurrIndex(next);
    currIndexRef.current = next;
    setTransitioning(false);
  };

  const hasMessages = messages.length > 0;
  const safeIdx = hasMessages ? currIndex % messages.length : 0;
  const nextIdx = hasMessages ? (safeIdx + 1) % messages.length : 0;
  const currentMsg = hasMessages ? messages[safeIdx] : null;
  const nextMsg = hasMessages && messages.length > 1 ? messages[nextIdx] : null;

  const renderMsg = (msg: CheerMessage) => (
    <>
      <span
        className="font-extrabold shrink-0 px-1.5 py-0.5 rounded-full text-[9px] whitespace-nowrap"
        style={{
          color: "var(--color-primary)",
          background: "var(--color-primary-light)",
        }}
      >
        {msg.nickname}
      </span>
      <span className="text-[11px] text-gray-500 truncate">{msg.text}</span>
    </>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 h-9 flex items-center gap-2.5 overflow-hidden">
      <span className="text-gray-300 text-xs shrink-0">💬</span>

      <style>{`
        @keyframes tickerExitUp {
          from { transform: translateY(0);     opacity: 1; }
          to   { transform: translateY(-110%); opacity: 0; }
        }
        @keyframes tickerEnterBelow {
          from { transform: translateY(110%);  opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>

      <div className="flex-1 relative h-5 overflow-hidden">
        {!hasMessages ? (
          <div className="absolute inset-0 flex items-center">
            <p className="text-[11px] text-gray-300">
              응원 메시지를 보내보세요!
            </p>
          </div>
        ) : (
          <>
            {currentMsg && (
              <div
                key={safeIdx}
                className="absolute inset-0 flex items-center gap-1.5"
                style={
                  transitioning
                    ? { animation: "tickerExitUp 0.38s ease-in-out forwards" }
                    : undefined
                }
              >
                {renderMsg(currentMsg)}
              </div>
            )}
            {transitioning && nextMsg && (
              <div
                key="entering"
                className="absolute inset-0 flex items-center gap-1.5"
                style={{
                  animation: "tickerEnterBelow 0.38s ease-in-out forwards",
                }}
                onAnimationEnd={handleEnterEnd}
              >
                {renderMsg(nextMsg)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CheerInput({
  input,
  onInputChange,
  onSend,
}: {
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
}) {
  const error = input.trim() ? validatePostText(input) : null;
  const canSend = input.trim() && !error;

  return (
    <div className="flex flex-col gap-1">
      <div className="bg-white rounded-3xl shadow-sm px-4 py-3 flex items-center gap-2">
        <span className="text-base shrink-0">💬</span>
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value.slice(0, 30))}
          onKeyDown={(e) => e.key === "Enter" && canSend && onSend()}
          placeholder="응원 메시지 보내기..."
          maxLength={30}
          className="flex-1 text-xs font-semibold text-gray-700 placeholder-gray-300 outline-none bg-transparent"
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          aria-label="응원 보내기"
          className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm transition active:scale-90 ${
            canSend ? "bg-primary text-white" : "bg-gray-100 text-gray-300"
          }`}
        >
          🚀
        </button>
      </div>
      {error && (
        <p className="text-[10px] text-red-400 font-semibold px-4">{error}</p>
      )}
    </div>
  );
}

function WelcomeModal({
  partyName,
  partyEmoji,
  onClose,
}: {
  partyName: string;
  partyEmoji: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-7 flex flex-col items-center gap-4 shadow-xl">
        <span className="text-5xl">{partyEmoji}</span>
        <p className="font-extrabold text-gray-800 text-xl text-center">
          파티에 합류했어요!
        </p>
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          <span className="font-bold text-gray-700">"{partyName}"</span>의<br />
          새 파티원이 되었어요!
          <br />
          함께 목표를 달성해봐요 💪
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-primary text-white text-sm font-extrabold active:scale-95 transition"
        >
          파티 둘러보기
        </button>
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
        <span className="text-5xl">🧹</span>
        <p className="font-extrabold text-gray-800 text-lg text-center">
          파티 정리할까요?
        </p>
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          <span className="font-bold text-gray-700">"{nickname}"</span> 님은
          <br />
          7일 이상 활동하지 않은 멤버예요.
          <br />
          파티에서 정리하시겠어요?
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
            정리하기
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
    <div className="fixed top-6 inset-x-0 flex justify-center z-50 pointer-events-none">
      <div className="bg-gray-800 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 whitespace-nowrap">
        <span>{icon}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}

function LeaderLeaveModal({
  partyName,
  hasOtherMembers,
  onConfirm,
  onCancel,
}: {
  partyName: string;
  hasOtherMembers: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-7 flex flex-col items-center gap-4 shadow-xl">
        <span className="text-5xl">{hasOtherMembers ? "👑" : "💥"}</span>
        <p className="font-extrabold text-gray-800 text-lg text-center">
          {hasOtherMembers ? "방장을 넘기고 나갈까요?" : "파티를 나갈까요?"}
        </p>
        <p className="text-sm text-gray-400 text-center leading-relaxed">
          {hasOtherMembers ? (
            <>
              <span className="font-bold text-gray-600">"{partyName}"</span> 파티의<br />
              방장이 가장 오래된 멤버에게<br />
              자동으로 넘어가요.
            </>
          ) : (
            <>
              혼자 남은 파티라<br />
              나가면 <span className="font-bold text-gray-600">"{partyName}"</span> 파티가<br />
              자동으로 해체돼요.
            </>
          )}
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
            {hasOtherMembers ? "넘기고 나가기" : "해체하고 나가기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeletePartyModal({
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
        <span className="text-5xl">💥</span>
        <p className="font-extrabold text-gray-800 text-lg text-center">
          파티를 해체할까요?
        </p>
        <p className="text-sm text-gray-400 text-center leading-relaxed">
          <span className="font-bold text-gray-600">"{partyName}"</span> 파티가
          <br />
          영구적으로 삭제돼요. 되돌릴 수 없어요.
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
            해체하기
          </button>
        </div>
      </div>
    </div>
  );
}

function NoticeSection({
  notices,
  isLeader,
  onPost,
  onDelete,
}: {
  notices: PartyNotice[];
  isLeader: boolean;
  onPost: (msg: string) => void;
  onDelete: (id: string) => void;
}) {
  const [input, setInput] = useState("");
  const [noticeError, setNoticeError] = useState<string | null>(null);

  function handleNoticeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.slice(0, 60);
    setInput(val);
    setNoticeError(val.trim() ? validatePostText(val) : null);
  }

  function handlePost() {
    const trimmed = input.trim();
    if (!trimmed || noticeError) return;
    onPost(trimmed);
    setInput("");
    setNoticeError(null);
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
      <p className="text-sm font-extrabold text-gray-700">📢 파티 공지</p>

      {notices.length === 0 ? (
        <p className="text-xs text-gray-300 text-center py-2">
          {isLeader ? "공지를 올려보세요!" : "아직 공지가 없어요"}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {notices.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-2 bg-orange-50 rounded-2xl px-4 py-3"
            >
              <p className="flex-1 text-xs text-gray-700 leading-relaxed font-semibold">
                {n.message}
              </p>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-[10px] text-gray-400">
                  {new Date(n.created_at).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                {isLeader && (
                  <button
                    onClick={() => onDelete(n.id)}
                    aria-label="공지 삭제"
                    className="text-[10px] text-gray-300 hover:text-red-400 transition font-bold"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLeader && (
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3">
            <input
              type="text"
              value={input}
              onChange={handleNoticeChange}
              onKeyDown={(e) => e.key === "Enter" && !noticeError && handlePost()}
              placeholder="공지 입력 (60자 이내)"
              maxLength={60}
              className="flex-1 text-xs font-semibold text-gray-700 placeholder-gray-300 outline-none bg-transparent"
            />
            <button
              onClick={handlePost}
              disabled={!input.trim() || !!noticeError}
              aria-label="공지 올리기"
              className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm transition active:scale-90 ${
                input.trim() && !noticeError
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-300"
              }`}
            >
              📌
            </button>
          </div>
          {noticeError && (
            <p className="text-[10px] text-red-400 font-semibold px-1">{noticeError}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PartyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useUser();
  const { selectedBubbleId } = useActiveBubble();
  const {
    isJoined,
    isLeader,
    joinParty,
    leaveParty,
    kickMember,
    isLoading: membershipLoading,
  } = useParty(user?.id ?? null);

  const [party, setParty] = useState<Party | null>(null);
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [todayStats, setTodayStats] = useState<PartyTodayStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showWelcomeModal, setShowWelcomeModal] = useState(
    (location.state as { newJoin?: boolean } | null)?.newJoin === true,
  );
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaderLeaveModal, setShowLeaderLeaveModal] = useState(false);
  const [kickTarget, setKickTarget] = useState<PartyMember | null>(null);
  const [toast, setToast] = useState<{ message: string; icon?: string } | null>(
    null,
  );
  const [cheerMessages, setCheerMessages] = useState<CheerMessage[]>([]);
  const [cheerInput, setCheerInput] = useState("");
  const [notices, setNotices] = useState<PartyNotice[]>([]);

  const sendCheer = async () => {
    const text = cheerInput.trim();
    if (!text || !id || !user) return;
    const nickname =
      userProfile?.nickname ??
      members.find((m) => m.user_id === user.id)?.nickname ??
      "나";
    setCheerMessages((prev) =>
      [...prev, { id: `temp-${Date.now()}`, nickname, text }].slice(-20),
    );
    setCheerInput("");
    await sendPartyCheer(id, user.id, nickname, text);
  };

  const showToast = (message: string, icon?: string) => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 2500);
  };

  const sortMembers = (list: PartyMember[]) =>
    list.sort((a, b) => {
      if (a.is_active !== b.is_active) return b.is_active ? 1 : -1;
      if (b.today_steps !== a.today_steps) return b.today_steps - a.today_steps;
      return b.weekly_steps - a.weekly_steps;
    });

  const reloadMembers = async () => {
    if (!id) return;
    const [m, s] = await Promise.all([
      getPartyMembers(id),
      getPartyTodayStats(id),
    ]);
    setMembers(sortMembers(m));
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
      setMembers(sortMembers(m));
      setTodayStats(s);
      setIsLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!isLoading && !membershipLoading && party) {
      if (!isJoined(party.id) && !isLeader(party)) {
        navigate("/party", { replace: true });
      }
    }
  }, [isLoading, membershipLoading, party]);

  useEffect(() => {
    if (!id) return;
    getPartyCheers(id).then((cheers) => {
      setCheerMessages(
        cheers.map((c) => ({
          id: c.id,
          nickname: c.nickname,
          text: c.message,
        })),
      );
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getPartyNotices(id).then(setNotices);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`party-notices-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "party_notices",
          filter: `party_id=eq.${id}`,
        },
        () => {
          getPartyNotices(id).then(setNotices);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handlePostNotice = async (message: string) => {
    if (!id || !user) return;
    await sendPartyNotice(id, user.id, message);
    getPartyNotices(id).then(setNotices);
  };

  const handleDeleteNotice = async (noticeId: string) => {
    await deletePartyNotice(noticeId);
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
  };

  const handleDeleteParty = async () => {
    if (!party) return;
    const { error } = await deleteParty(party.id);
    setShowDeleteModal(false);
    if (error) {
      showToast("해체에 실패했어요. 잠시 후 다시 시도해 주세요.", "⚠️");
    } else {
      navigate("/party", { replace: true });
    }
  };

  const handleLeaderLeave = async () => {
    if (!party || !user) return;
    const { error, dissolved } = await leavePartyAsLeader(party.id, user.id);
    setShowLeaderLeaveModal(false);
    if (error) {
      showToast("나가기에 실패했어요. 잠시 후 다시 시도해 주세요.", "⚠️");
    } else if (dissolved) {
      navigate("/party", { replace: true });
    } else {
      showToast("파티를 나왔어요", "👋");
      navigate("/party", { replace: true });
    }
  };

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`party-cheers-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "party_cheers",
          filter: `party_id=eq.${id}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            user_id: string;
            nickname: string;
            message: string;
          };
          if (row.user_id === user?.id) return;
          setCheerMessages((prev) =>
            [
              ...prev,
              { id: row.id, nickname: row.nickname, text: row.message },
            ].slice(-20),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user?.id]);

  // active_sessions 변경 시 멤버 상태(활성 여부·말풍선) 실시간 갱신
  useEffect(() => {
    if (!id || members.length === 0) return;
    const memberUserIds = new Set(members.map((m) => m.user_id));
    const channel = supabase
      .channel(`party-sessions-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "active_sessions" },
        (payload) => {
          const row = (payload.new ?? payload.old) as {
            user_id?: string;
          } | null;
          if (!row?.user_id || !memberUserIds.has(row.user_id)) return;
          reloadMembers();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, members.length]);

  const handleJoinConfirm = async () => {
    if (!party) return;
    const { error } = await joinParty(party.id);
    setShowJoinModal(false);
    if (!error) {
      showToast("파티에 참가했어요!", "🎉");
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
    const nickname = kickTarget.nickname;
    const { error } = await kickMember(party.id, kickTarget.user_id);
    setKickTarget(null);
    if (error) {
      showToast("강퇴에 실패했어요. 잠시 후 다시 시도해 주세요.", "⚠️");
    } else {
      showToast(`${nickname}님을 퇴장시켰어요`, "👢");
      await reloadMembers();
    }
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
    <div className="flex flex-col min-h-screen bg-bg mb-10">
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

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-4">
        {/* 파티 기본 정보 - 간략 */}
        <div className="bg-white rounded-3xl shadow-sm px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-2xl flex-shrink-0">
              {party.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-extrabold text-gray-800 text-sm truncate">
                  {party.name}
                </p>
                {leader && (
                  <span className="text-[9px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full shrink-0">
                    👑 방장
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                {party.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-gray-500 font-semibold bg-gray-50 px-2 py-1 rounded-full">
              {timeSlotEmoji[party.exercise_time] ?? "⏰"} {party.exercise_time}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold bg-gray-50 px-2 py-1 rounded-full">
              👥 {party.member_count}/{party.max_members}명
            </span>
            <span className="text-[10px] text-gray-500 font-semibold bg-gray-50 px-2 py-1 rounded-full">
              👟 {(party.target_steps ?? 10000).toLocaleString()}보
            </span>
            {party.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="text-[10px] bg-gray-100 text-gray-400 rounded-full px-2 py-1 font-semibold"
              >
                #{t}
              </span>
            ))}
            {party.tags.length > 2 && (
              <span className="text-[10px] text-gray-400 font-semibold">
                +{party.tags.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* 오늘 파티 현황 */}
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
          <p className="text-sm font-extrabold text-orange-400">
            🔥 오늘 파티 현황
          </p>
          {todayStats === null ? (
            <p className="text-xs text-gray-300 animate-pulse">
              불러오는 중...
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-700">
                  <span className="text-orange-500">
                    {todayStats.totalSteps.toLocaleString()}
                  </span>
                  {" / "}
                  {(
                    (party.target_steps ?? 10000) * party.member_count
                  ).toLocaleString()}
                  보
                </p>
                <p className="text-xs font-extrabold text-orange-400">
                  {Math.min(
                    Math.round(
                      (todayStats.totalSteps /
                        Math.max(
                          (party.target_steps ?? 10000) * party.member_count,
                          1,
                        )) *
                        100,
                    ),
                    100,
                  )}
                  %
                </p>
              </div>
              {todayStats.avgSteps > 0 && (
                <p className="text-[11px] text-gray-400 font-semibold">
                  파티 평균{" "}
                  <span className="text-orange-400 font-extrabold">
                    {todayStats.avgSteps.toLocaleString()}보
                  </span>
                </p>
              )}
              <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-primary rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      (todayStats.totalSteps /
                        Math.max(
                          (party.target_steps ?? 10000) * party.member_count,
                          1,
                        )) *
                        100,
                      100,
                    )}%`,
                  }}
                />
              </div>

              {todayStats.topMember &&
                (() => {
                  const mvp = members.find(
                    (m) => m.user_id === todayStats.topMember!.user_id,
                  );
                  return (
                    <div className="flex items-center gap-3 bg-amber-50 rounded-2xl px-4 py-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center overflow-hidden">
                          {mvp?.character_image ? (
                            <img
                              src={mvp.character_image}
                              alt={todayStats.topMember.nickname}
                              className="w-full h-full object-contain"
                              draggable={false}
                            />
                          ) : (
                            <span className="text-2xl">
                              {mvp?.character_emoji ?? "🏃"}
                            </span>
                          )}
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 text-base leading-none">
                          🥇
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wide">
                          오늘의 MVP
                        </p>
                        <p className="text-sm font-extrabold text-gray-800 leading-tight">
                          {todayStats.topMember.nickname}
                        </p>
                        <p className="text-xs font-bold text-amber-500">
                          {todayStats.topMember.steps.toLocaleString()}보
                        </p>
                      </div>
                    </div>
                  );
                })()}
            </>
          )}
        </div>

        {/* 파티 공지 */}
        <NoticeSection
          notices={notices}
          isLeader={leader}
          onPost={handlePostNotice}
          onDelete={handleDeleteNotice}
        />

        {/* 응원 ticker bar */}
        <CheerTicker messages={cheerMessages} />

        {/* 파티 멤버 활동 그리드 */}
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-gray-700">👥 파티 멤버</p>
            <p className="text-[10px] text-gray-400">
              {members.filter((m) => m.is_active).length > 0
                ? `${members.filter((m) => m.is_active).length}명 운동 중`
                : "모두 쉬는 중"}
            </p>
          </div>
          {members.length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-4">
              멤버가 없어요
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-x-2 gap-y-4">
              {members.map((m) => (
                <MemberActivityCard
                  key={m.user_id}
                  member={m}
                  isMe={m.user_id === user?.id}
                  isPartyLeader={m.user_id === party.created_by}
                  canKickInactive={leader && m.user_id !== user?.id}
                  onKick={() => setKickTarget(m)}
                  activeBubbleId={
                    m.user_id === user?.id
                      ? selectedBubbleId
                      : m.active_bubble_id
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* 응원 입력 */}
        <CheerInput
          input={cheerInput}
          onInputChange={setCheerInput}
          onSend={sendCheer}
        />
      </div>

      {/* 하단 액션 버튼 */}
      <div className="bg-white rounded-3xl shadow-sm p-4 flex gap-2">
        {joined ? (
          leader ? (
            <>
              <div className="flex-1 py-3 rounded-2xl bg-yellow-50 text-sm font-extrabold text-yellow-600 flex items-center justify-center gap-1">
                👑 파티장
              </div>
              <button
                onClick={() => setShowLeaderLeaveModal(true)}
                className="px-4 py-3 rounded-2xl bg-gray-100 text-sm font-bold text-gray-500 active:scale-95 transition"
              >
                나가기
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-3 rounded-2xl bg-red-50 text-sm font-bold text-red-400 active:scale-95 transition"
              >
                해체
              </button>
            </>
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

      {showWelcomeModal && party && (
        <WelcomeModal
          partyName={party.name}
          partyEmoji={party.emoji}
          onClose={() => setShowWelcomeModal(false)}
        />
      )}
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
      {showLeaderLeaveModal && party && (
        <LeaderLeaveModal
          partyName={party.name}
          hasOtherMembers={members.filter((m) => m.user_id !== user?.id).length > 0}
          onConfirm={handleLeaderLeave}
          onCancel={() => setShowLeaderLeaveModal(false)}
        />
      )}
      {showDeleteModal && party && (
        <DeletePartyModal
          partyName={party.name}
          onConfirm={handleDeleteParty}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {toast && <Toast message={toast.message} icon={toast.icon} />}
    </div>
  );
}
