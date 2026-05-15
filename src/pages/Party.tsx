import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PARTY_TAGS } from "../data/tags";
import { POINT_RULES } from "../data/points";
import { storage } from "../utils/storage";
import { useUser } from "../context/UserContext";
import { useParty } from "../hooks/useParty";
import { getPartyMembers, getPartyTodayStats } from "../lib/partyService";
import type {
  Party as PartyData,
  PartyMember,
  PartyTodayStats,
  CreatePartyInput,
} from "../lib/partyService";

type TimeSlot = "새벽" | "아침" | "저녁" | "주말";
type StepsOption = 5000 | 10000 | 15000;
type MaxMembersOption = 5 | 10 | 20;

const timeSlotEmoji: Record<TimeSlot, string> = {
  새벽: "🌅",
  아침: "☀️",
  저녁: "🌙",
  주말: "🏖️",
};

function MemberAvatar({
  image,
  fallback,
  size = "md",
}: {
  image: string | null;
  fallback: string;
  size?: "sm" | "md";
}) {
  const boxClass = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const imageClass = size === "sm" ? "w-9 h-9" : "w-10 h-10";

  return (
    <span
      className={`${boxClass} rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0`}
    >
      {image ? (
        <img
          src={image}
          alt=""
          className={`${imageClass} object-contain`}
          draggable={false}
        />
      ) : (
        <span className="text-xl">{fallback}</span>
      )}
    </span>
  );
}

function PartyCard({
  party,
  joined,
  isLeader,
  onRanking,
  onMembers,
  onJoin,
  onLeave,
  onDelete,
  onNavigate,
}: {
  party: PartyData;
  joined: boolean;
  isLeader: boolean;
  onRanking: (p: PartyData) => void;
  onMembers: (p: PartyData) => void;
  onJoin?: (p: PartyData) => void;
  onLeave?: (p: PartyData) => void;
  onDelete?: (p: PartyData) => void;
  onNavigate: (partyId: string) => void;
}) {
  const slotFull = party.member_count >= party.max_members;
  const [todayStats, setTodayStats] = useState<PartyTodayStats | null>(null);
  const [memberPreviews, setMemberPreviews] = useState<PartyMember[]>([]);

  useEffect(() => {
    getPartyTodayStats(party.id).then(setTodayStats);
    getPartyMembers(party.id).then((data) =>
      setMemberPreviews(data.slice(0, 3)),
    );
  }, [party.id]);

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-3xl flex-shrink-0">
          {party.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p
              className="font-extrabold text-gray-800 truncate cursor-pointer active:opacity-70"
              onClick={() => onNavigate(party.id)}
            >
              {party.name}
            </p>
            {isLeader && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(party);
                }}
                aria-label="파티 삭제"
                className="flex-shrink-0 w-7 h-7 rounded-full bg-red-50 text-red-400 text-xs font-bold flex items-center justify-center hover:bg-red-100 transition"
              >
                ✕
              </button>
            )}
          </div>
          <p
            className="text-xs text-gray-400 mt-0.5 line-clamp-2 cursor-pointer"
            onClick={() => onNavigate(party.id)}
          >
            {party.description}
            {party.active_count > 0 && (
              <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full whitespace-nowrap align-middle">
                <span className="text-[5px]">🟢</span>
                {party.active_count}명 운동 중
              </span>
            )}
          </p>
          <div
            className="flex flex-wrap gap-1 mt-2 cursor-pointer"
            onClick={() => onNavigate(party.id)}
          >
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
        <button
          onClick={() => onMembers(party)}
          className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2 text-left active:bg-gray-100 transition"
        >
          <div className="flex items-center">
            {memberPreviews.length > 0 ? (
              memberPreviews.map((m, i) => (
                <span
                  key={m.user_id}
                  className="w-7 h-7 rounded-full bg-white border-2 border-gray-50 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{ marginLeft: i > 0 ? "-8px" : "0", zIndex: 10 - i }}
                >
                  {m.character_image ? (
                    <img
                      src={m.character_image}
                      alt=""
                      className="w-8 h-8 object-contain"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-sm">{m.character_emoji}</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-base">👥</span>
            )}
          </div>
          <div>
            <p className="text-[10px] text-gray-400">멤버</p>
            <p className="text-xs font-bold text-gray-700">
              {party.member_count} / {party.max_members}명
            </p>
          </div>
        </button>
        <div className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2">
          <span className="text-base">👣</span>
          <div>
            <p className="text-[10px] text-gray-400">목표 걸음수</p>
            <p className="text-xs font-bold text-gray-700">
              {(party.target_steps ?? 10000).toLocaleString()}보/인
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

      <div className="bg-orange-50 rounded-xl px-3 py-1.5 flex flex-col gap-1">
        <p className="text-[10px] font-extrabold text-orange-400">
          🔥 오늘 파티 현황
        </p>
        {todayStats === null ? (
          <p className="text-[10px] text-gray-300 animate-pulse">
            불러오는 중...
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-gray-700">
                <span className="text-orange-500">
                  {todayStats.totalSteps.toLocaleString()}
                </span>
                {" / "}
                {(
                  (party.target_steps ?? 10000) * party.max_members
                ).toLocaleString()}
                보
              </p>
              <p className="text-[10px] font-bold text-orange-400">
                {Math.min(
                  Math.round(
                    (todayStats.totalSteps /
                      ((party.target_steps ?? 10000) * party.max_members)) *
                      100,
                  ),
                  100,
                )}
                %
              </p>
            </div>
            <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-primary rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(
                    (todayStats.totalSteps /
                      ((party.target_steps ?? 10000) * party.max_members)) *
                      100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => onRanking(party)}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
          >
            🏆 랭킹 보기
          </button>
          {joined ? (
            isLeader ? (
              <div className="flex-1 py-2.5 rounded-xl bg-yellow-50 text-xs font-bold text-yellow-600 flex items-center justify-center gap-1">
                👑 방장
              </div>
            ) : (
              <button
                onClick={() => onLeave?.(party)}
                className="flex-1 py-2.5 rounded-xl bg-green-100 text-xs font-bold text-green-600 active:scale-95 transition"
              >
                ✓ 참여중
              </button>
            )
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

function MembersBottomSheet({
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
  const [kickError, setKickError] = useState<string | null>(null);

  useEffect(() => {
    getPartyMembers(party.id).then((data) => {
      setMembers(data);
      setLoading(false);
    });
  }, [party.id]);

  const handleKickConfirm = async () => {
    if (!kickTarget) return;
    const { error } = await onKick(party.id, kickTarget.user_id);
    if (error) {
      setKickError("강퇴에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setKickTarget(null);
      return;
    }
    const updated = await getPartyMembers(party.id);
    setMembers(updated);
    setKickTarget(null);
  };

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
              {party.emoji} {party.name} 멤버
            </p>
            <button
              onClick={onClose}
              className="text-gray-400 text-xl font-bold"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          {kickError && (
            <p className="text-xs text-red-400 text-center font-bold">{kickError}</p>
          )}

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
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
              {members.map((m) => (
                <div
                  key={m.user_id}
                  className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3"
                >
                  <MemberAvatar
                    image={m.character_image}
                    fallback={m.character_emoji}
                    size="sm"
                  />
                  <p className="flex-1 font-bold text-gray-700 text-sm truncate">
                    {m.nickname}
                    {m.user_id === currentUserId && (
                      <span className="ml-1 text-[10px] text-primary">(나)</span>
                    )}
                    {m.user_id === party.created_by && (
                      <span className="ml-1.5 text-[9px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full">👑방장</span>
                    )}
                  </p>
                  {isLeader && m.user_id !== currentUserId && (
                    <button
                      onClick={() => { setKickError(null); setKickTarget(m); }}
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
                  <MemberAvatar
                    image={m.character_image}
                    fallback={m.character_emoji}
                  />
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
  const [steps, setSteps] = useState<StepsOption>(10000);
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
        ? PARTY_TAGS.filter((t) => selectedTagIds.includes(t.id)).map(
            (t) => t.name,
          )
        : [timeSlot];

    await onCreate({
      name: name.trim(),
      description: `${timeSlot} ${steps.toLocaleString()}보 함께 달려요!`,
      max_members: maxMembers,
      target_steps: steps,
      exercise_time: timeSlot,
      tags,
    });

    setSubmitting(false);
  };

  const stepsOptions: StepsOption[] = [5000, 10000, 15000];
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
          <label className="text-xs font-bold text-gray-500">목표 걸음수</label>
          <div className="flex gap-2">
            {stepsOptions.map((s) => (
              <button
                key={s}
                onClick={() => setSteps(s)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                  steps === s
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {s.toLocaleString()}보
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400">
            총 목표 {(steps * maxMembers).toLocaleString()}보 ({maxMembers}명 ×{" "}
            {steps.toLocaleString()}보)
          </p>
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
            {PARTY_TAGS.map((tag) => (
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

type Tab = "neighbor" | "mine";

export default function Party() {
  const navigate = useNavigate();
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
  const [membersParty, setMembersParty] = useState<PartyData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PartyData | null>(null);
  const [joinTarget, setJoinTarget] = useState<PartyData | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<PartyData | null>(null);
  const [toast, setToast] = useState<{ message: string; icon?: string } | null>(
    null,
  );
  const [filterTagId, setFilterTagId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (message: string, icon?: string) => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCreate = async (input: CreatePartyInput) => {
    const { error } = await createParty(input);
    if (!error) {
      setShowCreateModal(false);
      setShowSuccessModal(true);
    }
  };

  const handleJoinConfirm = async () => {
    if (!joinTarget) return;
    const { id: partyId, name: partyName } = joinTarget;
    const { error } = await joinParty(partyId);
    setJoinTarget(null);
    if (!error) {
      const today = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const todayStr = `${today.getFullYear()}.${pad(today.getMonth() + 1)}.${pad(today.getDate())}`;
      storage.addPoints(POINT_RULES.PARTY_JOIN);
      storage.addPointsHistory({
        date: todayStr,
        desc: `${partyName} 파티 참가`,
        points: POINT_RULES.PARTY_JOIN,
        icon: "🎉",
      });
      navigate(`/party/${partyId}`, { state: { newJoin: true } });
    }
  };

  const handleLeaveAttempt = (p: PartyData) => {
    if (isLeader(p)) {
      showToast("방장은 탈퇴할 수 없어요. 파티를 삭제해주세요.", "👑");
      return;
    }
    setLeaveTarget(p);
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
        const tagName = PARTY_TAGS.find((t) => t.id === filterTagId)?.name;
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
          {PARTY_TAGS.map((tag) => (
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
              onMembers={setMembersParty}
              onJoin={setJoinTarget}
              onLeave={handleLeaveAttempt}
              onDelete={setDeleteTarget}
              onNavigate={(partyId) => {
                  if (isJoined(partyId)) {
                    navigate(`/party/${partyId}`);
                  } else {
                    showToast("파티에 참가한 후 입장할 수 있어요", "🔒");
                  }
                }}
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
      {membersParty && (
        <MembersBottomSheet
          party={membersParty}
          isLeader={isLeader(membersParty)}
          currentUserId={user?.id}
          onKick={kickMember}
          onClose={() => setMembersParty(null)}
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
      {toast && <Toast message={toast.message} icon={toast.icon} />}
    </div>
  );
}
