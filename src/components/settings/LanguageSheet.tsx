import type { Language } from "../../hooks/useSettings";

const languages: { value: Language; label: string; native: string; flag: string }[] = [
  { value: "ko", label: "한국어", native: "Korean", flag: "🇰🇷" },
  { value: "en", label: "English", native: "영어", flag: "🇺🇸" },
];

export function LanguageSheet({
  current,
  onSelect,
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
        <div className="flex flex-col gap-2">
          {languages.map((lang) => {
            const isSelected = current === lang.value;
            return (
              <button
                key={lang.value}
                onClick={() => {
                  onSelect(lang.value);
                  onClose();
                }}
                className={`flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <p className={`font-bold text-sm ${isSelected ? "text-[var(--color-primary)]" : "text-gray-700"}`}>
                      {lang.label}
                    </p>
                    <p className="text-xs text-gray-400">{lang.native}</p>
                  </div>
                </div>
                {isSelected && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "var(--color-primary)" }}
                  >
                    <span className="text-white text-[10px] font-bold">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
