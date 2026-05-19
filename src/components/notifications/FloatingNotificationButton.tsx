import { useState } from "react";
import { useLocation } from "react-router-dom";
import { HiBell } from "react-icons/hi";
import { useUser } from "../../context/UserContext";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationDrawer } from "./NotificationDrawer";

const HIDDEN_PATHS = ["/workout", "/auth", "/intro", "/onboarding"];

export default function FloatingNotificationButton() {
  const { pathname } = useLocation();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications(user?.id ?? null);

  if (HIDDEN_PATHS.includes(pathname)) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`알림${unreadCount > 0 ? ` (읽지 않은 알림 ${unreadCount}개)` : ""}`}
        className="fixed top-4 right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
        }}
      >
        <HiBell size={20} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDrawer
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
          onRead={markAsRead}
          onMarkAllRead={markAllAsRead}
          onDelete={deleteNotification}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
