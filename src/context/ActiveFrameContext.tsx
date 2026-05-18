import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "selected_post_frame";

interface ActiveFrameContextValue {
  selectedFrameId: string;
  setSelectedFrameId: (id: string) => void;
}

const ActiveFrameContext = createContext<ActiveFrameContextValue | null>(null);

export function ActiveFrameProvider({ children }: { children: ReactNode }) {
  const [selectedFrameId, setSelectedFrameIdState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? "basic_post_frame",
  );

  const setSelectedFrameId = useCallback((id: string) => {
    setSelectedFrameIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  return (
    <ActiveFrameContext value={{ selectedFrameId, setSelectedFrameId }}>
      {children}
    </ActiveFrameContext>
  );
}

export function useActiveFrame(): ActiveFrameContextValue {
  const ctx = useContext(ActiveFrameContext);
  if (!ctx)
    throw new Error("useActiveFrame must be used inside ActiveFrameProvider");
  return ctx;
}
