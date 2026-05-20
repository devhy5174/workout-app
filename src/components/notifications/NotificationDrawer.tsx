import { HiBell, HiX, HiCheck, HiTrash } from "react-icons/hi";
import {
  HiUserGroup,
  HiFire,
  HiFlag,
  HiCake,
  HiSpeakerphone,
} from "react-icons/hi";
import { HiSparkles } from "react-icons/hi2";
import type { Notification, NotificationType } from "../../lib/notificationService";

const TYPE_META: Record<
  NotificationType,
  { icon: React.ReactNode; color: string }
> = {
  party_joined: {
    icon: <HiUserGroup size={16} className="text-white" />,
    color: "from-blue-400 to-blue-600",
  },
  party_started: {
    icon: <HiSpeakerphone size={16} className="text-white" />,
    color: "from-purple-400 to-purple-600",
  },
  goal_reached: {
    icon: <HiFlag size={16} className="text-white" />,
    color: "from-green-400 to-green-600",
  },
  streak_warning: {
    icon: <HiFire size={16} className="text-white" />,
    color: "from-orange-400 to-red-500",
  },
  diet_reminder: {
    icon: <HiCake size={16} className="text-white" />,
    color: "from-pink-400 to-pink-600",
  },
  system: {
    icon: <HiBell size={16} className="text-white" />,
    color: "from-gray-400 to-gray-600",
  },
  event: {
    icon: <HiSparkles size={16} className="text-white" />,
    color: "from-yellow-400 to-orange-400",
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function NotificationItem({
  notification,
  onRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: (path: string) => void;
}) {
  const meta = TYPE_META[notification.type] ?? TYPE_META.system;
  const path = notification.data?.path as string | undefined;

  const handleClick = () => {
    if (!notification.is_read) onRead(notification.id);
    if (path && onNavigate) onNavigate(path);
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${
        notification.is_read ? "bg-white" : "bg-blue-50/60"
      } ${path ? "cursor-pointer active:bg-gray-50" : ""}`}
      onClick={handleClick}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${meta.color}`}
      >
        {meta.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-bold leading-tight ${
              notification.is_read ? "text-gray-600" : "text-gray-900"
            }`}
          >
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          {notification.body}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {timeAgo(notification.created_at)}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
        aria-label="알림 삭제"
        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 hover:bg-gray-200 mt-0.5"
      >
        <HiTrash size={12} />
      </button>
    </div>
  );
}

export function NotificationDrawer({
  notifications,
  unreadCount,
  isLoading,
  onRead,
  onMarkAllRead,
  onDelete,
  onClose,
  onNavigate,
}: {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  onRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-gray-800">알림</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-[var(--color-primary)]">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                aria-label="모두 읽음"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-600"
              >
                <HiCheck size={13} />
                모두 읽음
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="닫기"
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
            >
              <HiX size={16} />
            </button>
          </div>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 min-h-0">
          {isLoading && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              불러오는 중...
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
              <HiBell size={36} className="opacity-30" />
              <p className="text-sm font-medium">아직 알림이 없어요</p>
            </div>
          )}

          {!isLoading &&
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={onRead}
                onDelete={onDelete}
                onNavigate={(path) => { onNavigate?.(path); onClose(); }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
