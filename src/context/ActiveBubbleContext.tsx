import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "selected_active_bubble";

/** 프리미엄 구독이 필요한 말풍선 ID 목록 */
export const PREMIUM_BUBBLE_IDS = new Set([
  "cute_bubble",
  "fire_bubble",
  "sweat_bubble",
  "health_bubble",
  "walk_bubble",
  "commute_home_bubble",
  "commute_work_bubble",
  "premium_active_bubble",
]);

interface ActiveBubbleContextValue {
  selectedBubbleId: string;
  setSelectedBubbleId: (id: string) => void;
}

const ActiveBubbleContext = createContext<ActiveBubbleContextValue | null>(null);

export function ActiveBubbleProvider({ children }: { children: ReactNode }) {
  const [selectedBubbleId, setSelectedBubbleIdState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? "basic_bubble",
  );

  const setSelectedBubbleId = useCallback((id: string) => {
    setSelectedBubbleIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  return (
    <ActiveBubbleContext value={{ selectedBubbleId, setSelectedBubbleId }}>
      {children}
    </ActiveBubbleContext>
  );
}

export function useActiveBubble(): ActiveBubbleContextValue {
  const ctx = useContext(ActiveBubbleContext);
  if (!ctx)
    throw new Error("useActiveBubble must be used inside ActiveBubbleProvider");
  return ctx;
}
