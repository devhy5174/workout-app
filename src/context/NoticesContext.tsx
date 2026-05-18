import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'workout_app_notices';
const DISMISSED_KEY = 'workout_app_dismissed_notices';

export interface Notice {
  id: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

interface NoticesContextType {
  notices: Notice[];
  activeNotice: Notice | null;
  addNotice: (content: string) => void;
  updateNotice: (id: string, content: string) => void;
  deleteNotice: (id: string) => void;
  toggleNotice: (id: string) => void;
  dismissNotice: (id: string) => void;
  dismissedIds: Set<string>;
}

const NoticesContext = createContext<NoticesContextType | null>(null);

function loadNotices(): Notice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Notice[];
  } catch {}
  return [];
}

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {}
  return new Set();
}

export function NoticesProvider({ children }: { children: React.ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>(loadNotices);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(loadDismissed);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissedIds]));
  }, [dismissedIds]);

  // 가장 최근 활성 공지 (dismissed 제외)
  const activeNotice =
    notices.find((n) => n.isActive && !dismissedIds.has(n.id)) ?? null;

  const addNotice = useCallback((content: string) => {
    // 새 공지를 추가할 때는 기존 공지 모두 비활성화
    setNotices((prev) => [
      {
        id: Date.now().toString(),
        content,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      ...prev.map((n) => ({ ...n, isActive: false })),
    ]);
  }, []);

  const updateNotice = useCallback((id: string, content: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, content } : n)),
    );
    // 수정된 공지는 다시 보이도록 dismissed 해제
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const deleteNotice = useCallback((id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const toggleNotice = useCallback((id: string) => {
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        // 활성화할 때는 다른 공지 모두 비활성화
        return { ...n, isActive: !n.isActive };
      }),
    );
    // 활성화 시 dismissed 해제
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const dismissNotice = useCallback((id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  }, []);

  return (
    <NoticesContext.Provider
      value={{
        notices,
        activeNotice,
        addNotice,
        updateNotice,
        deleteNotice,
        toggleNotice,
        dismissNotice,
        dismissedIds,
      }}
    >
      {children}
    </NoticesContext.Provider>
  );
}

export function useNotices(): NoticesContextType {
  const ctx = useContext(NoticesContext);
  if (!ctx) throw new Error('useNotices must be used within NoticesProvider');
  return ctx;
}
