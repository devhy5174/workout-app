import { useState } from "react";
import Modal from "../components/ui/Modal";
import CommunityWriteModal from "../components/CommunityWriteModal";

// ─── 타입 ─────────────────────────────────────────────────
interface Tag {
  emoji: string;
  label: string;
}

interface SensoryCard {
  id: string;
  label: string;
  gradient: string;
  emoji: string;
}

interface Post {
  id: number;
  card: SensoryCard;
  tag: Tag;
  text: string;
  nickname: string;
  title: string;
  steps: string;
  cheers: number;
  cheered: boolean;
  isMine?: boolean;
}

type TabType = "community" | "mine";

// ─── 감성 카드 프리셋 ──────────────────────────────────────
const SENSORY_CARDS: SensoryCard[] = [
  { id: "night",   label: "밤거리",  gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", emoji: "🌙" },
  { id: "sunset",  label: "노을",    gradient: "linear-gradient(135deg, #ff9a56 0%, #ff6b35 50%, #c94b4b 100%)", emoji: "🌅" },
  { id: "spring",  label: "봄길",    gradient: "linear-gradient(135deg, #f8c8d4 0%, #e8a4b8 50%, #d4849c 100%)", emoji: "🌸" },
  { id: "forest",  label: "숲속",    gradient: "linear-gradient(135deg, #a8d8a8 0%, #72b872 50%, #4a9e4a 100%)", emoji: "🌿" },
  { id: "rain",    label: "빗속",    gradient: "linear-gradient(135deg, #8fa8c8 0%, #6888a8 50%, #4a6888 100%)", emoji: "🌧️" },
  { id: "river",   label: "강변",    gradient: "linear-gradient(135deg, #b8d4e8 0%, #7ab0d4 50%, #4a8cb8 100%)", emoji: "🏞️" },
  { id: "dawn",    label: "새벽",    gradient: "linear-gradient(135deg, #2d1b69 0%, #5a2d82 50%, #8b5cf6 100%)", emoji: "🌌" },
  { id: "autumn",  label: "가을길",  gradient: "linear-gradient(135deg, #d4a04a 0%, #c47820 50%, #a05a10 100%)", emoji: "🍂" },
];

// ─── 태그 프리셋 ───────────────────────────────────────────
const TAGS: Tag[] = [
  { emoji: "🌙", label: "밤산책" },
  { emoji: "☀️", label: "아침걷기" },
  { emoji: "🌧️", label: "비오는날" },
  { emoji: "🔥", label: "목표달성" },
  { emoji: "🌱", label: "천천히걷기" },
  { emoji: "😴", label: "귀찮았지만성공" },
  { emoji: "💪", label: "오늘도완료" },
];

// ─── 더미 데이터 (나중에 useCommunity.ts 로 교체) ──────────
const DUMMY_POSTS: Post[] = [
  {
    id: 1, card: SENSORY_CARDS[0],
    tag: { emoji: "🌙", label: "밤산책" },
    text: "오늘은 진짜 나가기 싫었는데\n걷고 나니 개운하다 👣",
    nickname: "희연", title: "🌸 봄 산책러", steps: "6,240보", cheers: 24, cheered: false,
  },
  {
    id: 2, card: SENSORY_CARDS[1],
    tag: { emoji: "🔥", label: "목표달성" },
    text: "드디어 7일 연속 성공..!\n작은 거지만 나한테 진짜 뿌듯하다",
    nickname: "민준", title: "⚡ 파워워커", steps: "8,103보", cheers: 41, cheered: true,
  },
  {
    id: 3, card: SENSORY_CARDS[3],
    tag: { emoji: "🌱", label: "천천히걷기" },
    text: "오늘은 그냥 천천히 걸었어\n뭔가 생각 정리가 됐달까 🌿",
    nickname: "소은", title: "🥾 등산가", steps: "4,581보", cheers: 18, cheered: false,
  },
  {
    id: 4, card: SENSORY_CARDS[4],
    tag: { emoji: "🌧️", label: "비오는날" },
    text: "비 맞으면서 걸었는데\n의외로 기분 좋았음 ☔",
    nickname: "지안", title: "🌸 봄 산책러", steps: "3,940보", cheers: 15, cheered: true,
  },
  {
    id: 5, card: SENSORY_CARDS[6],
    tag: { emoji: "☀️", label: "아침걷기" },
    text: "새벽 5시에 일어나서 걸었어\n고요한 새벽 공기 최고 🌌",
    nickname: "준서", title: "🏃 러너", steps: "5,820보", cheers: 29, cheered: false,
  },
];

// 내 게시글 (isMine: true 인 것만)
const MY_POSTS: Post[] = [
  {
    id: 101, card: SENSORY_CARDS[0], isMine: true,
    tag: { emoji: "🌙", label: "밤산책" },
    text: "오늘 밤공기 진짜 좋다 👣",
    nickname: "나", title: "🌸 봄 산책러", steps: "4,200보", cheers: 8, cheered: false,
  },
  {
    id: 102, card: SENSORY_CARDS[7], isMine: true,
    tag: { emoji: "🍂", label: "천천히걷기" },
    text: "가을 느낌 나는 날씨에\n걷기 딱 좋았다",
    nickname: "나", title: "🌸 봄 산책러", steps: "3,100보", cheers: 5, cheered: false,
  },
];

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


// ─── 게시글 카드 ───────────────────────────────────────────
function PostCard({
  post,
  onCheer,
  showDelete,
}: {
  post: Post;
  onCheer: () => void;
  showDelete?: boolean;
}) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm shadow-stone-200/80">
      {/* 감성 카드 배경 */}
      <div
        className="relative h-36 flex items-end px-4 pb-3"
        style={{ background: post.card.gradient }}
      >
        <div className="absolute top-3 left-4">
          <span className="bg-white/20 backdrop-blur-sm border border-white/25 text-white/90 rounded-full px-2.5 py-1 text-[11px] font-medium">
            {post.card.emoji} {post.card.label}
          </span>
        </div>
        <div className="absolute top-3 right-4">
          <span className="bg-black/25 backdrop-blur-sm text-white rounded-full px-2.5 py-1 text-[11px] font-medium">
            {post.tag.emoji} {post.tag.label}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-1">
          <FootprintIcon className="w-3 h-3 text-white/80" />
          <span className="text-[11px] text-white/90 font-medium">{post.steps}</span>
        </div>
      </div>

      {/* 본문 */}
      <div className="px-4 pt-3.5 pb-4">
        <p className="text-[14px] text-stone-600 font-light leading-relaxed whitespace-pre-line mb-4">
          {post.text}
        </p>
        <div className="flex items-center justify-between">
          {/* 작성자 */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
              style={{ background: post.card.gradient }}
            >
              {post.nickname[0]}
            </div>
            <div>
              <p className="text-[13px] text-stone-700 font-medium leading-tight">{post.nickname}</p>
              <p className="text-[11px] text-stone-400 font-light mt-0.5">{post.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 내 게시글 삭제 버튼 */}
            {showDelete && (
              <button
                aria-label="게시글 삭제"
                className="text-stone-300 text-[11px] border border-stone-200 rounded-full px-2.5 py-1.5 active:scale-95 transition-transform duration-150"
              >
                삭제
              </button>
            )}
            {/* 응원 버튼 */}
            <button
              onClick={onCheer}
              aria-label={post.cheered ? "응원 취소" : "응원 보내기"}
              className={`
                flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium
                transition-all duration-150 active:scale-95
                ${post.cheered
                  ? "bg-orange-50 text-orange-500 border border-orange-200"
                  : "bg-stone-50 text-stone-400 border border-stone-200"}
              `}
            >
              <span>🌿</span>
              <span>{post.cheered ? `응원 완료` : "응원하기"}</span>
            </button>
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
  const [tab, setTab]                   = useState<TabType>("community");
  const [filterTags, setFilterTags]     = useState<string[]>([]);
  const [posts, setPosts]               = useState<Post[]>(DUMMY_POSTS);
  const [myPosts, setMyPosts]           = useState<Post[]>(MY_POSTS);
  const [writeModalOpen, setWriteModalOpen] = useState(false);

  const toggleFilterTag = (label: string) =>
    setFilterTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );

  const toggleCheer = (id: number, isMine = false) => {
    const updater = (prev: Post[]) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, cheered: !p.cheered, cheers: p.cheered ? p.cheers - 1 : p.cheers + 1 }
          : p
      );
    isMine ? setMyPosts(updater) : setPosts(updater);
  };

  const filteredPosts =
    filterTags.length === 0
      ? posts
      : posts.filter((p) => filterTags.includes(p.tag.label));


const openWriteModal = () => {

  setWriteModalOpen(true);

};

const closeWriteModal = () => {

  setWriteModalOpen(false);

};

  return (
    <div className="bg-[#faf8f5] min-h-screen max-w-[430px] mx-auto pb-24">

      {/* ── 헤더 ── */}
      <div className="sticky top-0 z-10 bg-[#faf8f5]/90 backdrop-blur-sm px-5 pt-5 pb-0 border-b border-stone-100/80">
        <div className="flex items-center gap-1.5 mb-0.5">
          <FootprintIcon className="w-[15px] h-[15px] text-orange-400" />
          <h1 className="text-[18px] font-bold text-stone-800 tracking-tight">오늘의 산책 기록</h1>
        </div>
        <p className="text-[12px] text-stone-400 font-light mb-3">
          오늘 걸은 기분을 가볍게 남겨보세요
        </p>

        {/* ── 탭 ── */}
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
                  relative flex items-center gap-1.5 px-4 py-2.5 text-[14px] font-medium
                  transition-colors duration-150
                  ${active ? "text-stone-800" : "text-stone-400"}
                `}
              >
                {label}
                {count !== undefined && (
                  <span
                    className={`
                      text-[11px] rounded-full px-1.5 py-0.5 font-semibold
                      ${active ? "bg-orange-100 text-orange-500" : "bg-stone-100 text-stone-400"}
                    `}
                  >
                    {count}
                  </span>
                )}
                {/* 활성 언더라인 */}
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

  className="

    w-full bg-white rounded-3xl p-5 mb-4

    border border-stone-100 shadow-sm

    flex items-center justify-between

    active:scale-[0.99]

    transition-all duration-150

  "

>

  <div className="flex items-center gap-3">

    <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center">

      <span className="text-xl">👣</span>

    </div>

    <div className="text-left">

      <p className="text-sm font-semibold text-stone-700">

        오늘의 산책 기록 남기기

      </p>

      <p className="text-[12px] text-stone-400 mt-0.5">

        가볍게 오늘 기분을 적어보세요

      </p>

    </div>

  </div>

  <div className="text-orange-400 text-xl">+</div>

</button>

            {/* 태그 필터 */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
              <button
                onClick={() => setFilterTags([])}
                className={`
                  flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium
                  transition-all duration-150 active:scale-95
                  ${filterTags.length === 0
                    ? "bg-stone-800 text-white"
                    : "bg-white text-stone-500 border border-stone-200"}
                `}
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
                    className={`
                      flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium
                      transition-all duration-150 active:scale-95 whitespace-nowrap
                      ${active
                        ? "bg-orange-400 text-white shadow-sm shadow-orange-200"
                        : "bg-white text-stone-500 border border-stone-200"}
                    `}
                  >
                    {tag.emoji} {tag.label}
                  </button>
                );
              })}
            </div>

            {/* 피드 */}
            <div className="flex flex-col gap-3">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onCheer={() => toggleCheer(post.id)}
                  />
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
            {/* 내 통계 요약 */}
            <div className="bg-white rounded-2xl p-4 mb-4 border border-stone-100 shadow-sm flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-[22px] font-bold text-stone-800">{myPosts.length}</p>
                <p className="text-[11px] text-stone-400 font-light mt-0.5">기록</p>
              </div>
              <div className="w-px h-8 bg-stone-100" />
              <div className="text-center flex-1">
                <p className="text-[22px] font-bold text-orange-400">
                  {myPosts.reduce((a, p) => a + p.cheers, 0)}
                </p>
                <p className="text-[11px] text-stone-400 font-light mt-0.5">받은 응원</p>
              </div>
              <div className="w-px h-8 bg-stone-100" />
              <div className="text-center flex-1">
                <p className="text-[22px] font-bold text-stone-800">3</p>
                <p className="text-[11px] text-stone-400 font-light mt-0.5">이번 주</p>
              </div>
            </div>

            {/* 내 게시글 피드 */}
            <div className="flex flex-col gap-3">
              {myPosts.length > 0 ? (
                myPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onCheer={() => toggleCheer(post.id, true)}
                    showDelete
                  />
                ))
              ) : (
                <EmptyState message="아직 기록이 없어요. 첫 산책을 남겨보세요 👣" />
              )}
            </div>
          
          </>
        )}
        <CommunityWriteModal

  isOpen={writeModalOpen}

  onClose={closeWriteModal}

  onSubmit={(data) => {
  const newPost: Post = {
    id: Date.now(),

    card: data.card || SENSORY_CARDS[0],

    tag: data.tag || {
      emoji: "👣",
      label: "산책기록",
    },

    text: data.text,

    nickname: "나",

    title: "🌸 봄 산책러",

    steps: `${Math.floor(Math.random() * 4000 + 3000).toLocaleString()}보`,

    cheers: 0,

    cheered: false,

    isMine: true,
  };

  // 커뮤니티 피드 추가
  setPosts((prev) => [newPost, ...prev]);

  // 내 게시글 추가
  setMyPosts((prev) => [newPost, ...prev]);

  closeWriteModal();
}}

/>
      </div>
    </div>
  );
  
}

