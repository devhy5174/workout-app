// 나중에 Supabase로 교체할 로컬스토리지 유틸
// TODO: Supabase 연동 시 이 파일만 수정하면 됨

const KEYS = {
  CHARACTER: "character",
  THEME: "theme",
  LANGUAGE: "language",
  STEPS: "steps",
  POINTS: "points",
} as const;

export const storage = {
  get: (key: keyof typeof KEYS) => localStorage.getItem(KEYS[key]),

  set: (key: keyof typeof KEYS, value: string) =>
    localStorage.setItem(KEYS[key], value),

  remove: (key: keyof typeof KEYS) => localStorage.removeItem(KEYS[key]),
};
