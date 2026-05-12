import { useLocation } from "react-router-dom";
import { useActivityType } from "../../context/ActivityTypeContext";
import { useCharacter } from "../../context/CharacterContext";

const pageConfig: Record<string, { title: string; icon: string }> = {
  "/": { title: "홈", icon: "🏠" },
  "/character": { title: "캐릭터", icon: "🧑" },
  "/party": { title: "파티", icon: "👥" },
  "/goal": { title: "목표", icon: "🎯" },
  "/diet": { title: "식단", icon: "🥗" },
  "/points": { title: "포인트", icon: "⭐" },
  "/settings": { title: "설정", icon: "⚙️" },
};

export default function Header() {
  const { pathname } = useLocation();
  const { selectedActivityType } = useActivityType();
  const { selectedCharacter } = useCharacter();
  if (pathname === "/workout") return null;
  const { title } = pageConfig[pathname] ?? {
    title: "워크아웃",
    icon: "🏋️",
  };

  const characterEmoji = selectedActivityType?.emoji ?? "🏃";

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-5 py-3"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
      }}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-extrabold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="text-sm font-bold text-white/90">0 P</span>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white/40 shadow-sm"
          style={{ background: "rgba(255,255,255,0.2)" }}
          aria-label="내 캐릭터"
        >
          {selectedCharacter ? (
            <img
              src={selectedCharacter.image}
              alt=""
              className="h-8 w-8 object-contain"
              draggable={false}
            />
          ) : (
            <span className="text-lg" role="img" aria-hidden="true">
              {characterEmoji}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
