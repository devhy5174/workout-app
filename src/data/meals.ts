import { type MealTime, type Nutrition } from "./diet";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type MealStatus = "logged" | "pending" | "skipped";

export interface MealFoodItem {
  name: string;
  emoji: string;
  kcal: number;
  protein: number; // g
  portion: string; // 예: "1공기", "100g", "1개"
}

export interface MealRecord {
  id: string; // Supabase 교체 시 uuid로 변경
  userId: string; // Supabase auth.uid()
  date: string; // "YYYY-MM-DD"
  mealTime: MealTime;
  timeLabel: string; // 표시용 한글 레이블
  timeEmoji: string;
  status: MealStatus;
  foods: MealFoodItem[];
  totalNutrition: Nutrition;
  loggedAt?: string; // ISO 8601
  note?: string;
}

// ─────────────────────────────────────────────
// Today's Meal Log (2026-05-07 기준 더미)
// ─────────────────────────────────────────────

export const todayMeals: MealRecord[] = [
  {
    id: "meal-001",
    userId: "dummy-user-01",
    date: "2026-05-07",
    mealTime: "breakfast",
    timeLabel: "아침",
    timeEmoji: "🌄",
    status: "logged",
    foods: [
      { name: "오트밀", emoji: "🥣", kcal: 150, protein: 5, portion: "1/2컵" },
      { name: "바나나", emoji: "🍌", kcal: 89, protein: 1, portion: "1개" },
      { name: "우유", emoji: "🥛", kcal: 111, protein: 6, portion: "200ml" },
    ],
    totalNutrition: { kcal: 350, protein: 12, carbs: 58, fat: 7 },
    loggedAt: "2026-05-07T07:30:00+09:00",
    note: "운동 전 가볍게",
  },
  {
    id: "meal-002",
    userId: "dummy-user-01",
    date: "2026-05-07",
    mealTime: "lunch",
    timeLabel: "점심",
    timeEmoji: "☀️",
    status: "logged",
    foods: [
      {
        name: "닭가슴살",
        emoji: "🍗",
        kcal: 165,
        protein: 31,
        portion: "100g",
      },
      { name: "현미밥", emoji: "🍚", kcal: 210, protein: 5, portion: "1공기" },
      { name: "샐러드", emoji: "🥗", kcal: 50, protein: 2, portion: "1그릇" },
      { name: "된장국", emoji: "🍲", kcal: 45, protein: 4, portion: "1그릇" },
    ],
    totalNutrition: { kcal: 470, protein: 42, carbs: 54, fat: 8 },
    loggedAt: "2026-05-07T12:15:00+09:00",
  },
  {
    id: "meal-003",
    userId: "dummy-user-01",
    date: "2026-05-07",
    mealTime: "dinner",
    timeLabel: "저녁",
    timeEmoji: "🌙",
    status: "pending",
    foods: [],
    totalNutrition: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    note: "미정",
  },
];

// ─────────────────────────────────────────────
// Weekly History (최근 7일)
// ─────────────────────────────────────────────

export const weeklyMealHistory: MealRecord[] = [
  {
    id: "meal-101",
    userId: "dummy-user-01",
    date: "2026-05-06",
    mealTime: "breakfast",
    timeLabel: "아침",
    timeEmoji: "🌄",
    status: "logged",
    foods: [
      {
        name: "그릭요거트",
        emoji: "🥛",
        kcal: 100,
        protein: 10,
        portion: "1컵",
      },
      {
        name: "아보카도 토스트",
        emoji: "🥑",
        kcal: 220,
        protein: 5,
        portion: "1조각",
      },
    ],
    totalNutrition: { kcal: 320, protein: 15, carbs: 28, fat: 16 },
    loggedAt: "2026-05-06T08:00:00+09:00",
  },
  {
    id: "meal-102",
    userId: "dummy-user-01",
    date: "2026-05-06",
    mealTime: "lunch",
    timeLabel: "점심",
    timeEmoji: "☀️",
    status: "logged",
    foods: [
      {
        name: "연어구이",
        emoji: "🐟",
        kcal: 208,
        protein: 20,
        portion: "100g",
      },
      { name: "현미밥", emoji: "🍚", kcal: 210, protein: 5, portion: "1공기" },
    ],
    totalNutrition: { kcal: 418, protein: 25, carbs: 44, fat: 15 },
    loggedAt: "2026-05-06T12:30:00+09:00",
  },
  {
    id: "meal-103",
    userId: "dummy-user-01",
    date: "2026-05-06",
    mealTime: "dinner",
    timeLabel: "저녁",
    timeEmoji: "🌙",
    status: "logged",
    foods: [
      { name: "삶은계란", emoji: "🥚", kcal: 156, protein: 12, portion: "2개" },
      { name: "고구마", emoji: "🍠", kcal: 130, protein: 2, portion: "1개" },
    ],
    totalNutrition: { kcal: 286, protein: 14, carbs: 31, fat: 10 },
    loggedAt: "2026-05-06T19:45:00+09:00",
  },
  {
    id: "meal-104",
    userId: "dummy-user-01",
    date: "2026-05-05",
    mealTime: "breakfast",
    timeLabel: "아침",
    timeEmoji: "🌄",
    status: "skipped",
    foods: [],
    totalNutrition: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    note: "늦잠으로 건너뜀",
  },
  {
    id: "meal-105",
    userId: "dummy-user-01",
    date: "2026-05-05",
    mealTime: "lunch",
    timeLabel: "점심",
    timeEmoji: "☀️",
    status: "logged",
    foods: [
      {
        name: "닭가슴살 도시락",
        emoji: "🍱",
        kcal: 420,
        protein: 38,
        portion: "1개",
      },
      {
        name: "방울토마토",
        emoji: "🍅",
        kcal: 30,
        protein: 1,
        portion: "10개",
      },
    ],
    totalNutrition: { kcal: 450, protein: 39, carbs: 42, fat: 10 },
    loggedAt: "2026-05-05T13:00:00+09:00",
  },
];

// ─────────────────────────────────────────────
// Daily Summary
// ─────────────────────────────────────────────

export interface DailySummary {
  date: string;
  totalKcal: number;
  kcalGoal: number;
  totalProtein: number;
  loggedMealCount: number;
  skippedMealCount: number;
}

export const getDailySummary = (
  records: MealRecord[],
  kcalGoal = 2000,
): DailySummary => {
  const logged = records.filter((r) => r.status === "logged");
  const skipped = records.filter((r) => r.status === "skipped");
  const totalKcal = logged.reduce((sum, r) => sum + r.totalNutrition.kcal, 0);
  const totalProtein = logged.reduce(
    (sum, r) => sum + r.totalNutrition.protein,
    0,
  );
  const date = records[0]?.date ?? new Date().toISOString().slice(0, 10);

  return {
    date,
    totalKcal,
    kcalGoal,
    totalProtein,
    loggedMealCount: logged.length,
    skippedMealCount: skipped.length,
  };
};

export const getTodaySummary = (): DailySummary => getDailySummary(todayMeals);

// ─────────────────────────────────────────────
// Supabase 교체 시 이 함수들을 API 호출로 대체
// ─────────────────────────────────────────────
//
// async function fetchTodayMeals(userId: string): Promise<MealRecord[]> {
//   const { data } = await supabase
//     .from("meal_records")
//     .select("*")
//     .eq("user_id", userId)
//     .eq("date", today)
//     .order("meal_time");
//   return data ?? [];
// }
