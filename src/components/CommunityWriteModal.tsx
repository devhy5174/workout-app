import { useEffect, useState } from "react";

// ───────────────── 타입 ─────────────────
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

interface CommunityWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    text: string;
    tag: Tag | null;
    card: SensoryCard | null;
  }) => void;
}

// ───────────────── 감성 카드 ─────────────────
const SENSORY_CARDS: SensoryCard[] = [
  {
    id: "night",
    label: "밤거리",
    gradient:
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    emoji: "🌙",
  },
  {
    id: "sunset",
    label: "노을",
    gradient:
      "linear-gradient(135deg, #ff9a56 0%, #ff6b35 50%, #c94b4b 100%)",
    emoji: "🌅",
  },
  {
    id: "spring",
    label: "봄길",
    gradient:
      "linear-gradient(135deg, #f8c8d4 0%, #e8a4b8 50%, #d4849c 100%)",
    emoji: "🌸",
  },
  {
    id: "forest",
    label: "숲속",
    gradient:
      "linear-gradient(135deg, #a8d8a8 0%, #72b872 50%, #4a9e4a 100%)",
    emoji: "🌿",
  },
  {
    id: "rain",
    label: "빗속",
    gradient:
      "linear-gradient(135deg, #8fa8c8 0%, #6888a8 50%, #4a6888 100%)",
    emoji: "🌧️",
  },
  {
    id: "river",
    label: "강변",
    gradient:
      "linear-gradient(135deg, #b8d4e8 0%, #7ab0d4 50%, #4a8cb8 100%)",
    emoji: "🏞️",
  },
];

// ───────────────── 태그 ─────────────────
const TAGS: Tag[] = [
  { emoji: "🌙", label: "밤산책" },
  { emoji: "☀️", label: "아침걷기" },
  { emoji: "🌧️", label: "비오는날" },
  { emoji: "🔥", label: "목표달성" },
  { emoji: "🌱", label: "천천히걷기" },
  { emoji: "😴", label: "귀찮았지만성공" },
  { emoji: "💪", label: "오늘도완료" },
];

export default function CommunityWriteModal({
  isOpen,
  onClose,
  onSubmit,
}: CommunityWriteModalProps) {
  const [text, setText] = useState("");
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [selectedCard, setSelectedCard] = useState<SensoryCard | null>(
    SENSORY_CARDS[0]
  );

  // 닫히면 초기화
  useEffect(() => {
    if (!isOpen) {
      setText("");
      setSelectedTag(null);
      setSelectedCard(SENSORY_CARDS[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!text.trim()) return;

    onSubmit?.({
      text,
      tag: selectedTag,
      card: selectedCard,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          absolute bottom-0 left-0 right-0
          bg-[#faf8f5]
          rounded-t-[32px]
          px-5 pt-3 pb-7
          animate-slideUp
          max-h-[90vh]
          overflow-y-auto
        "
      >
        {/* 핸들 */}
        <div className="w-14 h-1.5 bg-stone-200 rounded-full mx-auto mb-5" />

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[20px] font-bold text-stone-800">
              산책 기록 남기기 👣
            </h2>

            <p className="text-[12px] text-stone-400 mt-1">
              오늘 걸은 기분을 가볍게 적어보세요
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              w-9 h-9 rounded-full
              bg-white border border-stone-200
              text-stone-400
              flex items-center justify-center
              active:scale-95
            "
          >
            ✕
          </button>
        </div>

        {/* 감성 카드 */}
        <div className="mb-5">
          <p className="text-[13px] font-medium text-stone-600 mb-3">
            오늘 분위기
          </p>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {SENSORY_CARDS.map((card) => {
              const active = selectedCard?.id === card.id;

              return (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`
                    relative flex-shrink-0
                    w-20 h-16 rounded-2xl
                    overflow-hidden
                    transition-all duration-150
                    active:scale-95
                    ${
                      active
                        ? "ring-2 ring-orange-400 ring-offset-2"
                        : "ring-1 ring-stone-200"
                    }
                  `}
                  style={{
                    background: card.gradient,
                  }}
                >
                  <div className="absolute inset-0 bg-black/10" />

                  <div className="absolute bottom-2 left-2 text-left">
                    <p className="text-sm">{card.emoji}</p>

                    <p className="text-[11px] text-white font-medium mt-0.5">
                      {card.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 글 작성 */}
        <div className="mb-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="오늘은 어떤 걸음을 걸었나요?"
            className="
              w-full rounded-3xl bg-white
              border border-stone-200
              p-4
              text-[14px]
              text-stone-700
              placeholder:text-stone-300
              resize-none
              outline-none
              focus:border-orange-300
              focus:ring-4
              focus:ring-orange-100
              transition-all
            "
          />

          <div className="flex justify-end mt-2">
            <span className="text-[11px] text-stone-300">
              {text.length}/120
            </span>
          </div>
        </div>

        {/* 태그 */}
        <div className="mb-7">
          <p className="text-[13px] font-medium text-stone-600 mb-3">
            오늘의 기분
          </p>

          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => {
              const active = selectedTag?.label === tag.label;

              return (
                <button
                  key={tag.label}
                  onClick={() =>
                    setSelectedTag(active ? null : tag)
                  }
                  className={`
                    rounded-full px-4 py-2
                    text-[12px] font-medium
                    transition-all duration-150
                    active:scale-95
                    ${
                      active
                        ? "bg-orange-400 text-white shadow-sm shadow-orange-200"
                        : "bg-white border border-stone-200 text-stone-500"
                    }
                  `}
                >
                  {tag.emoji} {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 등록 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className={`
            w-full h-14 rounded-2xl
            text-sm font-bold
            transition-all duration-150
            ${
              text.trim()
                ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-200 active:scale-[0.98]"
                : "bg-stone-200 text-stone-400"
            }
          `}
        >
          기록 남기기
        </button>
      </div>
    </div>
  );
}