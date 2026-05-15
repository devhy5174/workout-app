import { useEffect, useState } from "react";
import { COMMUNITY_TAG_GROUPS } from "../data/tags";

// ───────────────── 타입 ─────────────────
interface CommunityWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { text: string; tags: string[] }) => void;
}

const MAX_TAGS = 2;

export default function CommunityWriteModal({
  isOpen,
  onClose,
  onSubmit,
}: CommunityWriteModalProps) {
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setText("");
      setSelectedTags([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTag = (label: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(label)) return prev.filter((t) => t !== label);
      if (prev.length >= MAX_TAGS) return prev;
      return [...prev, label];
    });
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit?.({ text, tags: selectedTags });
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
              운동 인증하기 👣
            </h2>
            <p className="text-[12px] text-stone-400 mt-1">
              오늘의 움직임을 함께 공유해보세요
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

        {/* 글 작성 */}
        <div className="mb-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="오늘 운동은 어땠나요?"
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

        {/* 태그 - 최대 2개 */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[13px] font-medium text-stone-600">
              오늘의 태그
            </p>
            <span className="text-[11px] text-stone-400">최대 2개</span>
          </div>

          <div className="flex flex-col gap-3">
            {COMMUNITY_TAG_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-[11px] font-bold text-stone-400 mb-2">
                  {group.title}
                </p>

                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => {
                    const active = selectedTags.includes(tag);
                    const disabled = !active && selectedTags.length >= MAX_TAGS;

                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
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
                ${disabled ? "opacity-40 pointer-events-none" : ""}
              `}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
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
