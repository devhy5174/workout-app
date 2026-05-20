import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

const TRIAL_KEY = "premium_trial_start";
const TRIAL_DAYS = 7;
const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

function getTrialDaysLeft(): number {
  const start = localStorage.getItem(TRIAL_KEY);
  if (!start) return 0;
  const elapsed = Date.now() - Number(start);
  const left = Math.ceil((TRIAL_MS - elapsed) / (24 * 60 * 60 * 1000));
  return Math.max(left, 0);
}

function isTrialActive(): boolean {
  return getTrialDaysLeft() > 0;
}

interface PremiumContextValue {
  isPremium: boolean;
  trialDaysLeft: number;
  startTrial: () => void;
  setPremium: (value: boolean) => void;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(() => isTrialActive());
  const [trialDaysLeft, setTrialDaysLeft] = useState(() => getTrialDaysLeft());

  useEffect(() => {
    const days = getTrialDaysLeft();
    setTrialDaysLeft(days);
    setIsPremium(days > 0);
  }, []);

  const startTrial = useCallback(() => {
    localStorage.setItem(TRIAL_KEY, String(Date.now()));
    setTrialDaysLeft(TRIAL_DAYS);
    setIsPremium(true);
  }, []);

  const setPremium = useCallback((value: boolean) => {
    setIsPremium(value);
  }, []);

  return (
    <PremiumContext value={{ isPremium, trialDaysLeft, startTrial, setPremium }}>
      {children}
    </PremiumContext>
  );
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used inside PremiumProvider");
  return ctx;
}
