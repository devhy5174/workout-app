import { useEffect, useState } from "react";
import { validatePostText } from "../data/nicknameFilters";

const QUICK_PHRASES = [
  "오늘 운동 인증 완료! 💪",
  "오늘도 꾸준히 걸었어요 🚶",
  "목표 달성! 뿌듯한 하루 🎯",
  "땀 흘린 만큼 보람차요 🔥",
  "오늘도 포기하지 않았어요 🏃",
  "아침산책 완료 🌅",
  "밤산책 다녀왔어요 🌙",
  "파워워킹 성공 ⚡",
  "오늘도 러닝 🏃",
  "등산 완등! 🏔️",
  "출근길 걷기 ✅",
  "퇴근 후 운동 💪",
  "귀찮았지만 성공 🎉",
];

interface CommunityWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { text: string; tags: string[] }) => void;
}

export default function CommunityWriteModal({
  isOpen,
  onClose,
  onSubmit,
}: CommunityWriteModalProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!isOpen) setText("");
  }, [isOpen]);

  if (!isOpen) return null;

  const validationError =
    text.trim().length > 0 ? validatePostText(text) : null;
  const canSubmit = text.trim().length > 0 && validationError === null;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.({ text, tags: [] });
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
            <h2 className="text-[20px] font-bold text-stone-800 flex items-center gap-2">
              운동 인증하기
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

        {/* 빠른 인증 문구 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3 -mx-1 px-1">
          {QUICK_PHRASES.map((phrase) => (
            <button
              key={phrase}
              onClick={() => setText(phrase)}
              className="flex-shrink-0 text-[11px] font-medium rounded-full px-3 py-1.5 transition-all duration-150 active:scale-95"
              style={
                text === phrase
                  ? { background: "var(--color-primary)", color: "white" }
                  : {
                      background: "white",
                      border: "1px solid #e7e5e4",
                      color: "#78716c",
                    }
              }
            >
              {phrase}
            </button>
          ))}
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
              transition-all
            "
            style={{
              // @ts-expect-error CSS custom property
              "--tw-ring-color": "var(--color-primary-light)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-primary)";
              e.target.style.boxShadow = "0 0 0 4px var(--color-primary-light)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "";
              e.target.style.boxShadow = "";
            }}
          />
          <div className="flex items-center justify-between mt-2">
            {validationError ? (
              <span className="text-[11px] text-red-400">
                {validationError}
              </span>
            ) : (
              <span />
            )}
            <span className="text-[11px] text-stone-300">
              {text.length}/120
            </span>
          </div>
        </div>

        {/* 등록 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full h-14 rounded-2xl text-sm font-bold transition-all duration-150 active:scale-[0.98]"
          style={
            canSubmit
              ? {
                  background: "var(--color-primary)",
                  color: "white",
                  boxShadow: "0 4px 12px var(--color-primary-light)",
                }
              : {
                  background: "#e7e5e4",
                  color: "#a8a29e",
                }
          }
        >
          인증 올리기
        </button>
      </div>
    </div>
  );
}
