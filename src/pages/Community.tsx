import { useState } from "react";
import CommunityWriteModal from "../components/CommunityWriteModal";
import { useCommunity } from "../hooks/useCommunity";
import { getCardById, type SensoryCard } from "../lib/communityService";
import { getAvatarCharacterById } from "../data/avatarCharacters";
import { getCharacterById } from "../data/activityTypes";

// ─── 타입 ─────────────────────────────────────────────────
interface Tag {
  label: string;
}

interface Post {
  id: string;
  card: SensoryCard;
  tag: Tag;
  text: string;
  nickname: string;
  title: string;
  steps: string;
  cheers: number;
  cheered: boolean;
  isMine?: boolean;
  character_id?: string | null;
}

type TabType = "community" | "mine";

// ─── 태그 필터 목록 ────────────────────────────────────────
const TAGS: Tag[] = [
  { label: "밤산책" },
  { label: "아침걷기" },
  { label: "출근길" },
  { label: "퇴근길산책" },
  { label: "비오는날" },
  { label: "목표달성" },
  { label: "천천히걷기" },
  { label: "귀찮았지만성공" },
  { label: "오늘도완료" },
];

function deriveTitle(activityTypeId: number | null): string {
  if (!activityTypeId) return "산책러";
  const type = getCharacterById(activityTypeId);
  return type ? `${type.emoji} ${type.name}` : "산책러";
}

function formatSteps(steps: number): string {
  return steps > 0 ? `${steps.toLocaleString()}보` : "0보";
}

// ─── 발자국 아이콘 ─────────────────────────────────────────
function FootprintIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="8.5" cy="7" rx="2.5" ry="3.5" />
      <ellipse cx="15.5" cy="10" rx="2.5" ry="3.5" />
      <ellipse cx="6" cy="14" rx="2" ry="2.8" transform="rotate(-15 6 14)" />
      <ellipse cx="12" cy="17.5" rx="2" ry="2.8" transform="rotate(10 12 17.5)" />
    </svg>
  );
}

// ─── 말풍선 카드 ───────────────────────────────────────────
function PostCard({
  post,
  onCheer,
  onDelete,
  showDelete,
}: {
  post: Post;
  onCheer: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}) {
  const characterImage = getAvatarCharacterById(post.character_id)?.image ?? null;

  return (
    <div className="flex items-start gap-2.5">

      {/* 아바타 */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-1">
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
        <span className="text-[10px] text-stone-400 font-light">{post.nickname}</span>
      </div>

      {/* 말풍선 */}
      <div className="flex-1 relative min-w-0">

        {/* 꼬리 삼각형 */}
        <div
          className="absolute -left-[7px] top-3.5 w-0 h-0"
          style={{
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            borderRight: "8px solid white",
            filter: "drop-shadow(-1px 0px 1px rgba(0,0,0,0.06))",
          }}
        />

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-2.5">

          {/* 감성 카드 배경 */}
          <div
            className="relative h-[100px] flex flex-col justify-between p-3 rounded-xl"
            style={{ background: post.card.gradient }}
          >
            {/* 상단: 카드 라벨 + 태그 */}
            <div className="flex items-center justify-between p-3 rounded-xl overflow-hidden">
              <span className="bg-white/20 backdrop-blur-sm border border-white/25 text-white/90 rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap">
                 {post.card.label}
              </span>
              <span className="bg-black/25 backdrop-blur-sm text-white rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap">
                #{post.tag.label}
              </span>
            </div>

            {/* 하단: 걸음수 */}
            <div className="flex items-center gap-1.5 self-start bg-black/25 backdrop-blur-sm rounded-full px-3 py-1">
              <FootprintIcon className="w-3.5 h-3.5 text-white" />
              <span className="text-[13px] text-white font-semibold">{post.steps}</span>
            </div>
          </div>

          {/* 텍스트 */}
          <div className="px-3.5 pt-3 pb-2.5">
            <p className="text-[14px] text-stone-700 font-normal leading-relaxed whitespace-pre-line">
              {post.text}
            </p>
          </div>

          {/* 하단 바: 칭호 + 버튼 */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-stone-50">
            <span className="text-[11px] text-stone-400 font-light">{post.title}</span>

            <div className="flex items-center gap-1.5">
              {showDelete && (
                <button
                  onClick={onDelete}
                  aria-label="게시글 삭제"
                  className="text-[11px] text-stone-300 border border-stone-200 rounded-full px-2.5 py-1 active:scale-95 transition-transform duration-150"
                >
                  삭제
                </button>
              )}
              <button
                onClick={onCheer}
                aria-label={post.cheered ? "응원 취소" : "응원 보내기"}
                className={`
                  flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium
                  transition-all duration-150 active:scale-95
                  ${post.cheered
                    ? "bg-orange-50 text-orange-500 border border-orange-200"
                    : "bg-stone-50 text-stone-400 border border-stone-200"}
                `}
              >
                <span>🌿</span>
                <span>{post.cheered ? "응원 완료" : "응원하기"}</span>
              </button>
            </div>
          </div>

        </div>
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
  const [tab, setTab]                       = useState<TabType>("community");
  const [filterTags, setFilterTags]         = useState<string[]>([]);
  const [writeModalOpen, setWriteModalOpen] = useState(false);

  const {
    posts,
    myPosts,
    cheeredIds,
    toggleCheer,
    submitPost,
    removePost,
    thisWeekCount,
    totalCheersReceived,
  } = useCommunity();

  const toggleFilterTag = (label: string) =>
    setFilterTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );

  // CommunityPost → Post (뷰 모델 변환)
  const toPost = (p: ReturnType<typeof useCommunity>["posts"][number], isMine?: boolean): Post => ({
    id: p.id,
    card: getCardById(p.card_id),
    tag: { label: p.tag },
    text: p.text,
    nickname: p.nickname,
    title: deriveTitle(p.activity_type_id),
    steps: formatSteps(p.steps),
    cheers: p.cheers,
    cheered: cheeredIds.has(p.id),
    isMine,
    character_id: p.character_id,
  });

  const enrichedPosts = posts.map((p) => toPost(p));
  const enrichedMyPosts = myPosts.map((p) => toPost(p, true));

  const filteredPosts =
    filterTags.length === 0
      ? enrichedPosts
      : enrichedPosts.filter((p) => filterTags.includes(p.tag.label));

  const openWriteModal  = () => setWriteModalOpen(true);
  const closeWriteModal = () => setWriteModalOpen(false);

  return (
    <div className="bg-bg min-h-screen max-w-[430px] mx-auto pb-24">

      {/* ── 헤더 + 탭 ── */}
      <div className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm px-5 pt-5 pb-0 border-b border-stone-100/80">
        <div className="flex items-center gap-1.5 mb-0.5">
          <FootprintIcon className="w-[15px] h-[15px] text-orange-400" />
          <h1 className="text-[18px] font-bold text-stone-800 tracking-tight">오늘의 산책 기록</h1>
        </div>
        <p className="text-[12px] text-stone-400 font-light mb-3">
          오늘 걸은 기분을 가볍게 남겨보세요
        </p>

        <div className="flex">
          {(["community", "mine"] as TabType[]).map((t) => {
            const label  = t === "community" ? "커뮤니티" : "내 게시글";
            const count  = t === "mine" ? myPosts.length : undefined;
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`
                  relative flex items-center gap-1.5 px-4 py-2.5 text-[14px] font-medium
                  transition-colors duration-150
                  ${active ? "text-stone-800" : "text-stone-400"}
                `}
              >
                {label}
                {count !== undefined && (
                  <span className={`text-[11px] rounded-full px-1.5 py-0.5 font-semibold
                    ${active ? "bg-orange-100 text-orange-500" : "bg-stone-100 text-stone-400"}`}>
                    {count}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-orange-400 rounded-full" />
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
                  <p className="text-sm font-semibold text-stone-700">오늘의 산책 기록 남기기</p>
                  <p className="text-[12px] text-stone-400 mt-0.5">가볍게 오늘 기분을 적어보세요</p>
                </div>
              </div>
              <div className="text-orange-400 text-xl font-light">+</div>
            </button>

            {/* 태그 필터 */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
              <button
                onClick={() => setFilterTags([])}
                className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all duration-150 active:scale-95
                  ${filterTags.length === 0 ? "bg-stone-800 text-white" : "bg-white text-stone-500 border border-stone-200"}`}
              >
                전체
              </button>
              {TAGS.map((tag) => {
                const active = filterTags.includes(tag.label);
                return (
                  <button
                    key={tag.label}
                    onClick={() => toggleFilterTag(tag.label)}
                    aria-label={`${tag.label} 필터`}
                    className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all duration-150 active:scale-95 whitespace-nowrap
                      ${active ? "bg-orange-400 text-white shadow-sm shadow-orange-200" : "bg-white text-stone-500 border border-stone-200"}`}
                  >
                    #{tag.label}
                  </button>
                );
              })}
            </div>

            {/* 말풍선 피드 */}
            <div className="flex flex-col gap-5">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onCheer={() => toggleCheer(post.id)} />
                ))
              ) : (
                <EmptyState message="해당 태그의 기록이 없어요" />
              )}
            </div>

            {filteredPosts.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-6 mb-2">
                <FootprintIcon className="w-3 h-3 text-stone-300" />
                <span className="text-[11px] text-stone-300 font-light">더 많은 기록 불러오기</span>
                <FootprintIcon className="w-3 h-3 text-stone-300" />
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
                <p className="text-[22px] font-bold text-stone-800">{myPosts.length}</p>
                <p className="text-[11px] text-stone-400 font-light mt-0.5">기록</p>
              </div>
              <div className="w-px h-8 bg-stone-100" />
              <div className="text-center flex-1">
                <p className="text-[22px] font-bold text-orange-400">{totalCheersReceived}</p>
                <p className="text-[11px] text-stone-400 font-light mt-0.5">받은 응원</p>
              </div>
              <div className="w-px h-8 bg-stone-100" />
              <div className="text-center flex-1">
                <p className="text-[22px] font-bold text-stone-800">{thisWeekCount}</p>
                <p className="text-[11px] text-stone-400 font-light mt-0.5">이번 주</p>
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
                    onDelete={() => removePost(post.id)}
                    showDelete
                  />
                ))
              ) : (
                <EmptyState message="아직 기록이 없어요. 첫 산책을 남겨보세요 👣" />
              )}
            </div>
          </>
        )}

      </div>

      {/* ── 모달 ── */}
      <CommunityWriteModal
        isOpen={writeModalOpen}
        onClose={closeWriteModal}
        onSubmit={async (data) => {
          await submitPost(data);
          closeWriteModal();
        }}
      />
    </div>
  );
}
