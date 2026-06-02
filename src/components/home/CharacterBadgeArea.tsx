import { useState, useRef } from "react";
import { HiPencil } from "react-icons/hi";
import { useAchievements } from "../../hooks/useAchievements";
import { useEquippedBadges } from "../../hooks/useEquippedBadges";
import { BadgeSprite } from "../ui/BadgeSprite";
import AlertModal from "../ui/AlertModal";

type Character = { image: string; [key: string]: unknown };
type UserProfile = {
  nickname?: string | null;
  title?: string | null;
  [key: string]: unknown;
};

type Props = {
  userId: string | undefined;
  selectedCharacter: Character | null;
  displayedText: string;
  bubbleMsg: string;
  activityTypeName: string | null;
  userProfile: UserProfile | null;
  onCharacterTap: () => void;
  greeting: string;
};

const BADGE_SIZE = 90;

export default function CharacterBadgeArea({
  userId,
  selectedCharacter,
  displayedText,
  bubbleMsg,
  activityTypeName,
  userProfile,
  onCharacterTap,
  greeting,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const placementRef = useRef<HTMLDivElement>(null);

  const {
    progress: achievementProgress,
    newlyUnlocked,
    dismissNewlyUnlocked,
  } = useAchievements();
  const unlockedBadges = achievementProgress
    .filter((p) => p.isUnlocked)
    .map((p) => p.achievement);
  const { equipped, place, remove } = useEquippedBadges(userId);

  const currentBadgePopup = newlyUnlocked[0] ?? null;

  const handleAreaTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editMode || !selectedBadgeId || !placementRef.current) return;
    const rect = placementRef.current.getBoundingClientRect();
    const halfW = BADGE_SIZE / 2 / rect.width;
    const halfH = BADGE_SIZE / 2 / rect.height;
    const x = Math.max(
      halfW,
      Math.min(1 - halfW, (e.clientX - rect.left) / rect.width),
    );
    const y = Math.max(
      halfH,
      Math.min(1 - halfH, (e.clientY - rect.top) / rect.height),
    );
    place(selectedBadgeId, x, y);
    setSelectedBadgeId(null);
  };

  return (
    <>
      {/* 배지 획득 팝업 */}
      {currentBadgePopup && (
        <AlertModal
          icon={undefined}
          iconClass=""
          title="🏅 배지 획득!"
          message={
            <div className="flex flex-col items-center gap-3 py-1">
              <BadgeSprite achievementId={currentBadgePopup.id} size={96} />
              <div className="text-center">
                <p className="text-base font-extrabold text-gray-800">
                  {currentBadgePopup.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentBadgePopup.description}
                </p>
              </div>
            </div>
          }
          confirmLabel={
            newlyUnlocked.length > 1
              ? `확인 (${newlyUnlocked.length - 1}개 더)`
              : "확인"
          }
          onConfirm={dismissNewlyUnlocked}
        />
      )}

      {/* 캐릭터 + 배지 배치 영역 */}
      <div
        ref={placementRef}
        className="relative w-full flex flex-col items-center px-6 pt-4 pb-2 mb-3"
        onClick={handleAreaTap}
      >
        {/* 장착 배지 레이어 (캐릭터 뒤) */}
        {equipped.map((badge) => (
          <div
            key={badge.id}
            className="absolute z-0"
            style={{
              left: `${badge.x * 100}%`,
              top: `${badge.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={(e) => {
              if (!editMode) return;
              e.stopPropagation();
              remove(badge.id);
            }}
          >
            <BadgeSprite
              achievementId={badge.id}
              size={BADGE_SIZE}
              className="drop-shadow-md"
            />
            {editMode && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center pointer-events-none">
                <span className="text-white text-[8px] font-bold">✕</span>
              </div>
            )}
          </div>
        ))}

        {/* 편집 모드 테두리 */}
        {editMode && (
          <div
            className="absolute inset-0 rounded-3xl border-2 border-dashed pointer-events-none z-20"
            style={{ borderColor: "var(--color-primary)", opacity: 0.5 }}
          />
        )}

        {/* 편집/완료 버튼 */}
        {!editMode ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditMode(true);
            }}
            className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center active:scale-95"
            aria-label="배지 배치 편집"
          >
            <HiPencil size={14} className="text-gray-400" />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditMode(false);
              setSelectedBadgeId(null);
            }}
            className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full text-white text-xs font-bold shadow-md"
            style={{ background: "var(--color-primary)" }}
          >
            완료
          </button>
        )}

        {/* 말풍선 */}
        <div className="relative z-10 bg-white rounded-2xl px-5 py-3 shadow-md mb-2 min-w-[180px]">
          <p className="text-sm font-bold text-gray-700 text-center">
            {displayedText}
            <span
              className={`inline-block w-[2px] h-[1em] bg-gray-500 align-middle ml-[1px] transition-opacity duration-300 ${
                displayedText.length < bubbleMsg.length
                  ? "animate-pulse"
                  : "opacity-0"
              }`}
            />
          </p>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-white" />
        </div>

        {/* 캐릭터 */}
        <div className="relative z-10 mt-4 flex flex-col items-center">
          <div
            onClick={onCharacterTap}
            className="w-56 h-56 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden border border-white/80 cursor-pointer active:scale-95 transition-transform duration-150"
          >
            {selectedCharacter ? (
              <img
                src={selectedCharacter.image}
                alt=""
                className="w-full h-full select-none object-contain scale-110"
                draggable={false}
              />
            ) : (
              <span className="text-8xl select-none">🏃</span>
            )}
          </div>
          <div className="text-center mt-3">
            {activityTypeName && (
              <span className="-bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary whitespace-nowrap">
                {activityTypeName}
              </span>
            )}
            <p className="text-xl font-extrabold text-gray-800">
              {greeting},{" "}
              {userProfile?.title ? `${userProfile.title.split(" ")[0]} ` : ""}
              {userProfile?.nickname ?? "운동왕"}님!
            </p>
          </div>
          <span className="absolute top-5 right-5 text-xl animate-bounce">
            ✨
          </span>
          <span className="absolute bottom-20 left-1 text-lg animate-bounce delay-150">
            ✨
          </span>
        </div>
      </div>

      {/* 편집 모드: 배지 선택 패널 */}
      {editMode && (
        <div className="mx-4 mb-3 bg-white rounded-2xl p-3 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 mb-2">
            {selectedBadgeId
              ? "위 영역을 탭해서 배치하세요 • 배치된 배지를 탭하면 제거"
              : "배치할 배지를 선택하세요"}
          </p>
          {unlockedBadges.length === 0 ? (
            <p className="text-xs text-gray-400 py-2 text-center">
              아직 획득한 배지가 없어요
            </p>
          ) : (
            <div className="flex gap-2 overflow-x-auto p-2 scrollbar-hide">
              {unlockedBadges.map((achievement) => (
                <button
                  key={achievement.id}
                  onClick={() =>
                    setSelectedBadgeId(
                      achievement.id === selectedBadgeId
                        ? null
                        : achievement.id,
                    )
                  }
                  className={`shrink-0 rounded-full overflow-hidden transition-all active:scale-95 ${
                    selectedBadgeId === achievement.id ? "scale-110" : ""
                  }`}
                  style={
                    selectedBadgeId === achievement.id
                      ? { boxShadow: "0 0 0 3px var(--color-primary)" }
                      : {}
                  }
                >
                  <BadgeSprite achievementId={achievement.id} size={44} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
