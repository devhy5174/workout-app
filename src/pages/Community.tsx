import React, { useState } from "react";
import CommunityWriteModal from "../components/CommunityWriteModal";
import AlertModal from "../components/ui/AlertModal";
import { HiTrash } from "react-icons/hi";
import { PiHandsClappingFill } from "react-icons/pi";
import { useCommunity } from "../hooks/useCommunity";
import { getCardById, type SensoryCard } from "../lib/communityService";
import { getAvatarCharacterById } from "../data/avatarCharacters";
import { getCharacterById } from "../data/activityTypes";
import { useUser } from "../context/UserContext";
import { useActiveFrame } from "../context/ActiveFrameContext";
import { resolvePostFrame } from "../data/postFrames";

// ─── 타입 ─────────────────────────────────────────────────

interface Post {
  id: string;
  card: SensoryCard;
  tags: string[];
  text: string;
  nickname: string;
  title: string;
  profileTitle: string | null;
  steps: string;
  cheers: number;
  cheered: boolean;
  isMine?: boolean;
  character_id?: string | null;
  frame_id: string | null;
}

type TabType = "community" | "mine";

function deriveTitle(activityTypeId: number | null): string {
  if (!activityTypeId) return "산책러";
  const type = getCharacterById(activityTypeId);
  return type ? `${type.name}` : "산책러";
}

function formatSteps(steps: number): string {
  return steps > 0 ? `${steps.toLocaleString()}보` : "0보";
}

// ─── 발자국 아이콘 ─────────────────────────────────────────
function FootprintIcon({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <ellipse cx="8.5" cy="7" rx="2.5" ry="3.5" />
      <ellipse cx="15.5" cy="10" rx="2.5" ry="3.5" />
      <ellipse cx="6" cy="14" rx="2" ry="2.8" transform="rotate(-15 6 14)" />
      <ellipse
        cx="12"
        cy="17.5"
        rx="2"
        ry="2.8"
        transform="rotate(10 12 17.5)"
      />
    </svg>
  );
}

// ─── 말풍선 카드 ───────────────────────────────────────────
function PostCard({
  post,
  onCheer,
  onDelete,
  showDelete,
  frameId,
}: {
  post: Post;
  onCheer: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
  frameId?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cheerKey, setCheerKey] = useState(0);
  const [showCheerPop, setShowCheerPop] = useState(false);

  const isLong = post.text.length > 40 || post.text.includes("\n");
  const characterImage =
    getAvatarCharacterById(post.character_id)?.image ?? null;
  const frame = resolvePostFrame(frameId);

  const handleCheer = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheer();
    if (!post.cheered) {
      setCheerKey((k) => k + 1);
      setShowCheerPop(true);
      setTimeout(() => setShowCheerPop(false), 800);
    }
  };

  const cardInner = (
    <div
      className={`relative px-3.5 py-2.5 ${
        frame.premium
          ? "bg-white rounded-2xl"
          : "bg-white rounded-2xl border border-stone-100 shadow-sm"
      } ${isLong ? "cursor-pointer select-none" : ""}`}
      onClick={isLong ? () => setExpanded((v) => !v) : undefined}
    >
      {/* 프리미엄 배경 펄스 오버레이 — 아이콘·텍스트 색상 영향 없음 */}
      {frame.premium && frame.bgPulseClass && (
        <div className={`absolute inset-0 rounded-2xl pointer-events-none animate-card-bg-pulse ${frame.bgPulseClass}`} />
      )}
      <div className="relative z-[1] flex items-center gap-2">
        {/* 걸음수 */}
        <div
          className="flex-shrink-0 flex items-center"
          style={frame.premium ? undefined : { color: "var(--color-primary)" }}
        >
          <span
            className={`text-[13px] font-extrabold ${frame.premium ? frame.labelColorClass : ""}`}
          >
            {post.steps}
          </span>
        </div>

        <div className="w-px h-3.5 bg-stone-200 flex-shrink-0" />

        {/* 글 내용 */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <p
            className={`text-[13px] text-stone-700 leading-snug ${!expanded && isLong ? "line-clamp-1" : "whitespace-pre-line"}`}
          >
            {post.text}
          </p>
          {expanded && post.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mt-1.5">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 박수 / 삭제 아이콘 — 내 글이면 숨김 */}
        {(showDelete || !post.isMine) && (
          <div className="relative flex-shrink-0 w-5 flex items-center justify-center">
            {showCheerPop && (
              <span
                key={cheerKey}
                className="absolute bottom-full left-1/2 mb-1 pointer-events-none animate-cheer-float text-[11px] font-bold whitespace-nowrap"
                style={{ color: "var(--color-primary)" }}
              >
                응원해요!
              </span>
            )}
            {showDelete ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                aria-label="게시글 삭제"
                className="text-stone-300 active:scale-95 transition-transform duration-150"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCheer}
                aria-label={post.cheered ? "응원 취소" : "응원 보내기"}
                className="active:scale-90 transition-transform duration-150"
              >
                <PiHandsClappingFill
                  className="w-5 h-5 transition-all duration-150"
                  style={{
                    color: post.cheered ? "#d6d3d1" : "var(--color-primary)",
                  }}
                />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-2.5">
      {/* 아바타 */}
      <div className="w-14 flex-shrink-0 flex flex-col items-center gap-0.5">
        <div className="h-4 flex items-center justify-center">
          {post.profileTitle && (
            <span className="text-[9px] text-stone-400 font-semibold text-center leading-tight whitespace-nowrap">
              {post.profileTitle}
            </span>
          )}
        </div>
        {characterImage ? (
          <img
            src={characterImage}
            alt={post.nickname}
            className="w-10 h-10 rounded-full object-cover shadow-md"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
            style={{ background: post.card.gradient }}
          >
            {post.nickname[0]}
          </div>
        )}

        <span className="text-[10px] text-stone-500 text-center font-semibold font-light w-full truncate">
          {post.nickname}
        </span>
      </div>

      {/* 말풍선 */}
      <div className="flex-1 min-w-0">
        {frame.premium ? (
          <div
            className={`p-[2px] rounded-[20px] ${frame.wrapperClass} ${frame.animationClass} shadow-md`}
          >
            {cardInner}
          </div>
        ) : (
          cardInner
        )}
      </div>
    </div>
  );
}

// ─── 빈 상태 ───────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <FootprintIcon className="w-10 h-10 text-stone-200" />
      <p className="text-sm text-stone-300 font-light">{message}</p>
    </div>
  );
}

// ─── 메인 페이지 ───────────────────────────────────────────
export default function CommunityPage() {
  const [tab, setTab] = useState<TabType>("community");
  const [filterTags] = useState<string[]>([]);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { user } = useUser();
  const { selectedFrameId } = useActiveFrame();
  const {
    posts,
    myPosts,
    cheeredIds,
    toggleCheer,
    submitPost,
    removePost,
    thisWeekCount,
    totalCheersReceived,
    hasMore,
    isLoadingMore,
    loadMore,
  } = useCommunity();

  // CommunityPost → Post (뷰 모델 변환)
  const toPost = (
    p: ReturnType<typeof useCommunity>["posts"][number],
  ): Post => ({
    id: p.id,
    card: getCardById(p.card_id),
    tags: p.tags,
    text: p.text,
    nickname: p.nickname,
    title: deriveTitle(p.activity_type_id),
    profileTitle: p.profile_title ?? null,
    steps: formatSteps(p.steps),
    cheers: p.cheers,
    cheered: cheeredIds.has(p.id),
    isMine: p.user_id === user?.id,
    character_id: p.character_id,
    frame_id: p.frame_id ?? null,
  });

  const enrichedPosts = posts.map((p) => toPost(p));
  const enrichedMyPosts = myPosts.map((p) => toPost(p));

  const filteredPosts =
    filterTags.length === 0
      ? enrichedPosts
      : enrichedPosts.filter((p) => p.tags.some((t) => filterTags.includes(t)));

  const openWriteModal = () => setWriteModalOpen(true);
  const closeWriteModal = () => setWriteModalOpen(false);

  return (
    <div className="bg-bg min-h-screen max-w-[430px] mx-auto pb-24">
      {/* ── 헤더 + 탭 ── */}
      <div className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm px-5 pt-5 pb-0 border-b border-stone-100/80">
        <div className="flex items-center gap-1.5 mb-0.5">
          <FootprintIcon className="w-[15px] h-[15px] text-[var(--color-primary)]" />
          <h1 className="text-[18px] font-bold text-stone-800 tracking-tight">
            오늘의 운동 인증
          </h1>
        </div>
        <p className="text-[12px] text-stone-400 font-light mb-3">
          오늘의 움직임을 함께 공유해보세요
        </p>

        <div className="flex">
          {(["community", "mine"] as TabType[]).map((t) => {
            const label = t === "community" ? "커뮤니티" : "내 게시글";
            const count = t === "mine" ? myPosts.length : undefined;
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`
                  relative flex items-center gap-1.5 px-4 py-2.5 text-[14px] font-bold 
                  transition-colors duration-150 
                  ${active ? "text-[var(--color-primary)]" : "text-stone-400"}
                `}
              >
                {label}
                {count !== undefined && (
                  <span
                    className={`text-[11px] rounded-full px-1.5 py-0.5 font-semibold
                    ${active ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]" : "bg-stone-100 text-stone-400"}`}
                  >
                    {count}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[var(--color-primary)] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* ── 커뮤니티 탭 ── */}
        {tab === "community" && (
          <>
            {/* 기록 남기기 버튼 */}
            <button
              onClick={openWriteModal}
              className="w-full bg-white rounded-3xl p-5 mb-4 border border-stone-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <span className="text-xl">👣</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-stone-700">
                    오늘의 운동 기록 남기기
                  </p>
                  <p className="text-[12px] text-stone-400 mt-0.5">
                    오늘의 움직임을 가볍게 기록해보세요
                  </p>
                </div>
              </div>
              <div className="text-[var(--color-primary)] text-xl font-light">
                +
              </div>
            </button>

            {/* 말풍선 피드 */}
            <div className="flex flex-col gap-5">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onCheer={() => toggleCheer(post.id)}
                    frameId={post.frame_id ?? null}
                  />
                ))
              ) : (
                <EmptyState message="해당 태그의 기록이 없어요" />
              )}
            </div>

            {filteredPosts.length > 0 && (
              <div className="flex items-center justify-center mt-6 mb-2">
                {hasMore ? (
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 px-4 py-2 rounded-full active:scale-95 transition-all duration-150 disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2 text-[11px] text-stone-400 font-light">
                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        불러오는 중...
                      </span>
                    ) : (
                      <>
                        <FootprintIcon className="w-3 h-3 text-stone-300" />
                        <span className="text-[11px] text-stone-400 font-semibold">
                          더 많은 기록 불러오기
                        </span>
                        <FootprintIcon className="w-3 h-3 text-stone-300" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <FootprintIcon className="w-3 h-3 text-stone-200" />
                    <span className="text-[11px] text-stone-300 font-light">
                      모든 기록을 다 봤어요
                    </span>
                    <FootprintIcon className="w-3 h-3 text-stone-200" />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── 내 게시글 탭 ── */}
        {tab === "mine" && (
          <>
            {/* 통계 요약 */}
            <div className="bg-white rounded-2xl p-4 mb-5 border border-stone-100 shadow-sm flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-[22px] font-bold text-stone-800">
                  {myPosts.length}
                </p>
                <p className="text-[11px] text-stone-400 font-light mt-0.5">
                  기록
                </p>
              </div>
              <div className="w-px h-8 bg-stone-100" />
              <div className="text-center flex-1">
                <p className="text-[22px] font-bold text-[var(--color-primary)]">
                  {totalCheersReceived}
                </p>
                <p className="text-[11px] text-stone-400 font-light mt-0.5">
                  받은 응원
                </p>
              </div>
              <div className="w-px h-8 bg-stone-100" />
              <div className="text-center flex-1">
                <p className="text-[22px] font-bold text-stone-800">
                  {thisWeekCount}
                </p>
                <p className="text-[11px] text-stone-400 font-light mt-0.5">
                  이번 주
                </p>
              </div>
            </div>

            {/* 내 말풍선 피드 */}
            <div className="flex flex-col gap-5">
              {enrichedMyPosts.length > 0 ? (
                enrichedMyPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onCheer={() => toggleCheer(post.id)}
                    onDelete={() => setDeleteTargetId(post.id)}
                    showDelete
                    frameId={post.frame_id ?? null}
                  />
                ))
              ) : (
                <EmptyState message="아직 기록이 없어요. 첫 움직인 기록을 남겨보세요 👣" />
              )}
            </div>
          </>
        )}
      </div>

      {/* ── 삭제 확인 모달 ── */}
      {deleteTargetId !== null && (
        <AlertModal
          icon={HiTrash}
          iconClass="text-primary"
          title="게시글 삭제"
          message="이 기록을 삭제할까요? 삭제 후에는 되돌릴 수 없어요."
          confirmLabel="삭제"
          onConfirm={() => {
            if (deleteTargetId) removePost(deleteTargetId);
            setDeleteTargetId(null);
          }}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}

      {/* ── 글쓰기 모달 ── */}
      <CommunityWriteModal
        isOpen={writeModalOpen}
        onClose={closeWriteModal}
        onSubmit={async (data) => {
          await submitPost({ text: data.text, tags: data.tags, frame_id: selectedFrameId });
          closeWriteModal();
        }}
      />
    </div>
  );
}
