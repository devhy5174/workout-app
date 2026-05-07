// 나중에 Supabase로 교체할 로컬스토리지 유틸
// TODO: Supabase 연동 시 이 파일만 수정하면 됨

const KEYS = {
  CHARACTER: "character",
  THEME: "theme",
  LANGUAGE: "language",
  STEPS: "steps",
  POINTS: "points",
  RECOMMENDED_DIET: "recommended_diet",
  TODAY_BURNED_KCAL: "today_burned_kcal",
  TODAY_DATE: "today_date",
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

  getBurnedKcal: (): number => {
    const savedDate = localStorage.getItem(KEYS.TODAY_DATE);
    const today = new Date().toDateString();

    // 날짜 바뀌면 자동 초기화
    if (savedDate !== today) {
      localStorage.setItem(KEYS.TODAY_DATE, today);
      localStorage.removeItem(KEYS.TODAY_BURNED_KCAL);
      return 0;
    }

    const raw = localStorage.getItem(KEYS.TODAY_BURNED_KCAL);
    if (raw === null) return 0;
    const n = Number(raw);
    return isNaN(n) ? 0 : n;
  },

  setBurnedKcal: (kcal: number) => {
    localStorage.setItem(KEYS.TODAY_DATE, new Date().toDateString());
    localStorage.setItem(KEYS.TODAY_BURNED_KCAL, String(kcal));
  },
};
