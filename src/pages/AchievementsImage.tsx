import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft, HiLockClosed } from "react-icons/hi";
import {
  useAchievements,
  type AchievementProgress,
} from "../hooks/useAchievements";
import {
  ACHIEVEMENT_CATEGORY_LABELS,
  type AchievementCategory,
  type AchievementDifficulty,
} from "../data/achievements";
import { BadgeSprite } from "../components/ui/BadgeSprite";

const DIFFICULTY_BADGE: Record<
  AchievementDifficulty,
  { ring: string; label: string; labelColor: string }
> = {
  easy: {
    ring: "ring-emerald-300",
    label: "쉬움",
    labelColor: "text-emerald-600 bg-emerald-50",
  },
  normal: {
    ring: "ring-blue-300",
    label: "보통",
    labelColor: "text-blue-600 bg-blue-50",
  },
  hard: {
    ring: "ring-orange-300",
    label: "어려움",
    labelColor: "text-orange-600 bg-orange-50",
  },
  legend: {
    ring: "ring-violet-400",
    label: "레전드",
    labelColor: "text-violet-600 bg-violet-50",
  },
};

const CATEGORY_ORDER: Array<AchievementCategory | "all"> = [
  "all",
  "walking",
  "streak",
  "steps",
  "party",
  "post",
  "time",
  "fun",
  "premium",
];

function BadgeDetailSheet({
  item,
  onClose,
}: {
  item: AchievementProgress;
  onClose: () => void;
}) {
  const { achievement, current, isUnlocked, pct } = item;
  const diff = DIFFICULTY_BADGE[achievement.difficulty];
  const isHidden = !!achievement.hidden && !isUnlocked;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 배지 이미지 */}
        <div className="flex flex-col items-center gap-3 mb-5">
          <div
            className={`relative rounded-full overflow-hidden shadow-lg ${
              isUnlocked
                ? "ring-4 ring-yellow-300 ring-offset-2"
                : "ring-4 ring-gray-200 ring-offset-2"
            }`}
          >
            {isHidden ? (
              <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-4xl">
                ❓
              </div>
            ) : (
              <BadgeSprite
                achievementId={achievement.id}
                size={96}
                grayscale={!isUnlocked}
              />
            )}
            {!isUnlocked && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <HiLockClosed size={28} className="text-white/80" />
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-gray-800">
                {isHidden ? "???" : achievement.name}
              </h2>
              {isUnlocked && (
                <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                  ✓ 달성
                </span>
              )}
            </div>
            <span
              className={`inline-block mt-1 text-xs font-bold px-3 py-0.5 rounded-full ${diff.labelColor}`}
            >
              {diff.label}
            </span>
          </div>
        </div>

        {/* 달성 조건 */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold text-gray-500 mb-1">달성 조건</p>
          <p className="text-sm font-semibold text-gray-700">
            {isHidden ? "조건을 달성하면 공개돼요" : achievement.description}
          </p>
        </div>

        {/* 진행률 */}
        {!isUnlocked && !isHidden && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-500">진행률</span>
              <span
                className="text-xs font-extrabold"
                style={{ color: "var(--color-primary)" }}
              >
                {current.toLocaleString()} /{" "}
                {achievement.condition.target.toLocaleString()} ({pct}%)
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background:
                    "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
                  opacity: pct === 0 ? 0 : 1,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BadgeCard({
  item,
  onTap,
}: {
  item: AchievementProgress;
  onTap: () => void;
}) {
  const { achievement, current, isUnlocked, pct } = item;
  const diff = DIFFICULTY_BADGE[achievement.difficulty];
  const isHidden = !!achievement.hidden && !isUnlocked;

  return (
    <button
      onClick={onTap}
      className={`bg-white rounded-3xl p-4 shadow-sm flex flex-col items-center gap-2.5 active:scale-95 transition-all text-left w-full ${
        isUnlocked ? "ring-2 ring-yellow-300 shadow-md" : ""
      }`}
    >
      {/* 배지 이미지 */}
      <div className="relative">
        <div className="rounded-full overflow-hidden shadow-md w-16 h-16">
          {isHidden ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">
              ❓
            </div>
          ) : (
            <BadgeSprite
              achievementId={achievement.id}
              size={64}
              grayscale={!isUnlocked}
            />
          )}
        </div>
        {!isUnlocked && (
          <div className="absolute inset-0 rounded-full bg-black/25 flex items-center justify-center">
            <HiLockClosed size={18} className="text-white/80" />
          </div>
        )}
        {isUnlocked && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-[9px] font-extrabold text-white">✓</span>
          </div>
        )}
      </div>

      <p
        className={`text-xs font-extrabold text-center leading-tight ${isUnlocked ? "text-gray-800" : "text-gray-400"}`}
      >
        {isHidden ? "???" : achievement.name}
      </p>

      <p className="text-[10px] text-gray-400 text-center leading-tight line-clamp-2">
        {isHidden ? "미공개" : achievement.description}
      </p>

      <span
        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${diff.labelColor}`}
      >
        {diff.label}
      </span>

      {!isUnlocked && !isHidden && (
        <div className="w-full">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background:
                  "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
                opacity: pct === 0 ? 0 : 1,
              }}
            />
          </div>
          <p className="text-[9px] text-gray-400 text-center mt-0.5">
            {current.toLocaleString()} /{" "}
            {achievement.condition.target.toLocaleString()}
          </p>
        </div>
      )}
    </button>
  );
}

export default function AchievementsImage() {
  const navigate = useNavigate();
  const { progress, unlockedCount, total } = useAchievements();
  const [activeCategory, setActiveCategory] = useState<
    AchievementCategory | "all"
  >("all");
  const [selectedItem, setSelectedItem] = useState<AchievementProgress | null>(
    null,
  );

  const filtered =
    activeCategory === "all"
      ? progress
      : progress.filter((p) => p.achievement.category === activeCategory);

  const categoryLabel = (c: AchievementCategory | "all") =>
    c === "all" ? "전체" : ACHIEVEMENT_CATEGORY_LABELS[c];

  const overallPct = Math.round((unlockedCount / total) * 100);

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 pt-12 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition"
            aria-label="뒤로가기"
          >
            <HiArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-extrabold text-gray-800">
                업적 배지
              </h1>
              <span
                className="text-sm font-extrabold"
                style={{ color: "var(--color-primary)" }}
              >
                {unlockedCount}
                <span className="text-gray-400 font-semibold text-xs">
                  {" "}
                  / {total}
                </span>
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
              <span>✨</span>
              배지를 모아 나만의 홈화면을 꾸며보세요
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${overallPct}%`,
                    background:
                      "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 font-semibold shrink-0">
                {overallPct}%
              </span>
            </div>
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === c
                  ? "text-white shadow-sm"
                  : "bg-gray-100 text-gray-500"
              }`}
              style={
                activeCategory === c
                  ? {
                      background:
                        "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                    }
                  : {}
              }
            >
              {categoryLabel(c)}
            </button>
          ))}
        </div>
      </div>

      {/* 배지 그리드 */}
      <div className="grid grid-cols-2 gap-3 p-4 pb-28">
        {filtered.map((item) => (
          <BadgeCard
            key={item.achievement.id}
            item={item}
            onTap={() => setSelectedItem(item)}
          />
        ))}
      </div>

      {selectedItem && (
        <BadgeDetailSheet
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
