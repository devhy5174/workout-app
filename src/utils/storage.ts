// 나중에 Supabase로 교체할 로컬스토리지 유틸
// TODO: Supabase 연동 시 이 파일만 수정하면 됨

const KEYS = {
  CHARACTER: "character",
  THEME: "theme",
  LANGUAGE: "language",
  STEPS: "steps",
  POINTS: "points",
  RECOMMENDED_DIET: "recommended_diet",
} as const;

export type RecommendedDiet = {
  durationLabel: string;
  durationMeals: { emoji: string; name: string }[];
  characterEmoji?: string;
  characterName?: string;
  characterMeals?: { emoji: string; name: string }[];
  tip?: string;
};

export const storage = {
  get: (key: keyof typeof KEYS) => localStorage.getItem(KEYS[key]),

  set: (key: keyof typeof KEYS, value: string) =>
    localStorage.setItem(KEYS[key], value),

  remove: (key: keyof typeof KEYS) => localStorage.removeItem(KEYS[key]),

  getRecommendedDiet: (): RecommendedDiet | null => {
    const raw = localStorage.getItem(KEYS.RECOMMENDED_DIET);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RecommendedDiet;
    } catch {
      return null;
    }
  },

  setRecommendedDiet: (diet: RecommendedDiet) =>
    localStorage.setItem(KEYS.RECOMMENDED_DIET, JSON.stringify(diet)),
};
