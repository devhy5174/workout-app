export const PREMIUM_STEPS_PATH = "/steps";
export const PREMIUM_TAB_PARAM = "premium";

export function getPremiumTabPath(): string {
  return `${PREMIUM_STEPS_PATH}?tab=${PREMIUM_TAB_PARAM}`;
}

export type PremiumStepsTab = "step" | "premium" | "events";

export function isPremiumStepsTab(value: string | null): value is PremiumStepsTab {
  return value === "step" || value === "premium" || value === "events";
}
