// 나중에 Supabase로 교체할 로컬스토리지 유틸
// TODO: Supabase 연동 시 이 파일만 수정하면 됨

const KEYS = {
  CHARACTER: "character",
  AVATAR_CHARACTER: "avatar_character",
  THEME: "theme",
  LANGUAGE: "language",
  STEPS: "steps",
  POINTS: "points",
  POINTS_HISTORY: "points_history",
  RECOMMENDED_DIET: "recommended_diet",
  TODAY_BURNED_KCAL: "today_burned_kcal",
  TODAY_DATE: "today_date",
  WORKOUT_HISTORY: "workout_history",
  JOINED_PARTY_IDS: "joined_party_ids",
  /** 프리미엄 유저 끼니별 선택 메뉴 ID (breakfast / lunch / dinner) */
  PREMIUM_MEAL_MENU_IDS: "premium_meal_menu_ids",
} as const;

export type PremiumMealMenuIds = Partial<
  Record<"breakfast" | "lunch" | "dinner", number>
>;

export type PointHistoryEntry = {
  date: string;
  desc: string;
  points: number;
  icon: string;
};

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

  getWorkoutHistory: (): string[] => {
    const raw = localStorage.getItem(KEYS.WORKOUT_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  },

  getJoinedPartyIds: (): number[] => {
    const raw = localStorage.getItem(KEYS.JOINED_PARTY_IDS);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as number[];
    } catch {
      return [];
    }
  },

  setJoinedPartyIds: (ids: number[]) =>
    localStorage.setItem(KEYS.JOINED_PARTY_IDS, JSON.stringify(ids)),

  getPoints: (): number => {
    const raw = localStorage.getItem(KEYS.POINTS);
    if (!raw) return 0;
    const n = Number(raw);
    return isNaN(n) ? 0 : n;
  },

  addPoints: (amount: number): number => {
    const next = storage.getPoints() + amount;
    localStorage.setItem(KEYS.POINTS, String(next));
    return next;
  },

  getPointsHistory: (): PointHistoryEntry[] => {
    const raw = localStorage.getItem(KEYS.POINTS_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as PointHistoryEntry[];
    } catch {
      return [];
    }
  },

  addPointsHistory: (entry: PointHistoryEntry) => {
    const hist = storage.getPointsHistory();
    hist.unshift(entry);
    localStorage.setItem(KEYS.POINTS_HISTORY, JSON.stringify(hist));
  },

  getPremiumMealMenuIds: (): PremiumMealMenuIds | null => {
    const raw = localStorage.getItem(KEYS.PREMIUM_MEAL_MENU_IDS);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PremiumMealMenuIds;
    } catch {
      return null;
    }
  },

  setPremiumMealMenuIds: (ids: PremiumMealMenuIds) =>
    localStorage.setItem(KEYS.PREMIUM_MEAL_MENU_IDS, JSON.stringify(ids)),

  clearPremiumMealMenuIds: () =>
    localStorage.removeItem(KEYS.PREMIUM_MEAL_MENU_IDS),

  addWorkoutToday: () => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const history = storage.getWorkoutHistory();
    if (!history.includes(today)) {
      history.push(today);
      localStorage.setItem(KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    }
  },
};
