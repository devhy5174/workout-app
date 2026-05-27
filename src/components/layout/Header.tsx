import { useState } from "react";
import { useLocation } from "react-router-dom";
import { HiBell } from "react-icons/hi";
import { useActivityType } from "../../context/ActivityTypeContext";
import { useCharacter } from "../../context/CharacterContext";
import { useUser } from "../../context/UserContext";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationDrawer } from "../notifications/NotificationDrawer";

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
  const { user } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(user?.id ?? null);

  if (pathname === "/workout") return null;

  const { title } = pageConfig[pathname] ?? { title: "워크아웃", icon: "🏋️" };
  const characterEmoji = selectedActivityType?.emoji ?? "🏃";

  return (
    <>
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
          {/* 알림 종 */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label={`알림 ${unreadCount > 0 ? `(읽지 않은 알림 ${unreadCount}개)` : ""}`}
            className="relative w-9 h-9 rounded-full flex items-center justify-center border-2 border-white/40 shadow-sm"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <HiBell size={18} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* 캐릭터 아바타 */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white/40 shadow-sm overflow-hidden"
            style={{ background: "rgba(255,255,255,0.2)" }}
            aria-label="내 캐릭터"
          >
            {selectedCharacter ? (
              <img
                src={selectedCharacter.image}
                alt=""
                className="h-8 w-8 object-contain scale-110"
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

      {drawerOpen && (
        <NotificationDrawer
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
          onRead={markAsRead}
          onMarkAllRead={markAllAsRead}
          onDelete={deleteNotification}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
}
