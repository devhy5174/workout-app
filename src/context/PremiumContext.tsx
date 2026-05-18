import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

/** QA / 개발용: true로 바꾸면 앱 전체가 프리미엄 상태로 시작 */
const DEV_IS_PREMIUM = false;

interface PremiumContextValue {
  isPremium: boolean;
  togglePremium: () => void;
  setPremium: (value: boolean) => void;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(DEV_IS_PREMIUM);

  const togglePremium = useCallback(() => {
    setIsPremium((prev) => !prev);
  }, []);

  const setPremium = useCallback((value: boolean) => {
    setIsPremium(value);
  }, []);

  return (
    <PremiumContext value={{ isPremium, togglePremium, setPremium }}>
      {children}
    </PremiumContext>
  );
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used inside PremiumProvider");
  return ctx;
}
