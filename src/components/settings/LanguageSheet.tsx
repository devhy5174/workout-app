//# 언어 선택 바텀시트

import type { Language } from "../../hooks/useSettings";

const languages: {
  value: Language;
  label: string;
  native: string;
  flag: string;
}[] = [
  { value: "ko", label: "한국어", native: "Korean", flag: "🇰🇷" },
  { value: "en", label: "English", native: "영어", flag: "🇺🇸" },
];

export function LanguageSheet({
  onClose,
}: {
  current: Language;
  onSelect: (l: Language) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-5 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-extrabold text-gray-800">언어 선택</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col items-center gap-4 py-6">
          <span className="text-5xl">🌍</span>
          <p className="font-extrabold text-gray-700 text-base">
            다국어 지원 준비 중이에요
          </p>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            영어 등 다양한 언어를 곧 지원할 예정이에요.
            <br />
            조금만 기다려 주세요!
          </p>
          <div className="flex gap-2 mt-1">
            {languages.map((lang) => (
              <span
                key={lang.value}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-bold text-gray-400"
              >
                {lang.flag} {lang.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
