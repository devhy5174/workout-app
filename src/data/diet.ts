import type { CharacterType } from "./characters";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type MealTime = "breakfast" | "lunch" | "dinner" | "snack";

export interface Nutrition {
  kcal: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
}

export interface RecommendedFood {
  id: number;
  name: string;
  emoji: string;
  description: string;
  nutrition: Nutrition;
  portion: string; // 1인분 기준 설명
  tags: string[]; // 예: ['고단백', '저지방', '비건']
  mealTimes: MealTime[];
  forCharacters: CharacterType[]; // 추천 캐릭터 유형
}

export interface RecommendedMenu {
  id: number;
  name: string;
  emoji: string;
  description: string;
  mealTime: MealTime;
  foods: Pick<RecommendedFood, "name" | "emoji" | "nutrition">[];
  totalNutrition: Nutrition;
  tags: string[];
  forCharacters: CharacterType[];
  prepTime: number; // 분
}

// ─────────────────────────────────────────────
// Recommended Foods (단품)
// ─────────────────────────────────────────────

export const recommendedFoods: RecommendedFood[] = [
  {
    id: 1,
    name: "삶은계란",
    emoji: "🥚",
    description: "완전 단백질 공급원. 포만감이 오래 지속돼요.",
    nutrition: { kcal: 78, protein: 6, carbs: 1, fat: 5 },
    portion: "1개 (50g)",
    tags: ["고단백", "저탄수화물", "간편"],
    mealTimes: ["breakfast", "snack"],
    forCharacters: ["runner", "power_walker", "hiker"],
  },
  {
    id: 2,
    name: "고구마",
    emoji: "🍠",
    description: "복합 탄수화물과 식이섬유가 풍부해 에너지가 오래가요.",
    nutrition: { kcal: 130, protein: 2, carbs: 30, fat: 0 },
    portion: "중간 크기 1개 (130g)",
    tags: ["복합탄수화물", "식이섬유", "비타민A"],
    mealTimes: ["breakfast", "lunch", "snack"],
    forCharacters: ["walker", "hiker", "power_walker"],
  },
  {
    id: 3,
    name: "그릭요거트",
    emoji: "🥛",
    description: "일반 요거트 대비 단백질 2배. 장 건강에도 좋아요.",
    nutrition: { kcal: 100, protein: 10, carbs: 6, fat: 3 },
    portion: "1컵 (170g)",
    tags: ["고단백", "프로바이오틱스", "저지방"],
    mealTimes: ["breakfast", "snack"],
    forCharacters: ["walker", "power_walker"],
  },
  {
    id: 4,
    name: "닭가슴살",
    emoji: "🍗",
    description: "운동인의 필수 단백질 식품. 지방이 매우 적어요.",
    nutrition: { kcal: 165, protein: 31, carbs: 0, fat: 4 },
    portion: "1조각 (100g)",
    tags: ["고단백", "저지방", "근합성"],
    mealTimes: ["lunch", "dinner"],
    forCharacters: ["runner", "power_walker", "hiker"],
  },
  {
    id: 5,
    name: "현미밥",
    emoji: "🍚",
    description: "백미보다 GI 지수가 낮아 혈당을 천천히 올려요.",
    nutrition: { kcal: 210, protein: 5, carbs: 44, fat: 2 },
    portion: "1공기 (210g)",
    tags: ["복합탄수화물", "식이섬유", "포만감"],
    mealTimes: ["lunch", "dinner"],
    forCharacters: ["walker", "runner", "hiker"],
  },
  {
    id: 6,
    name: "연어",
    emoji: "🐟",
    description: "오메가3와 단백질이 풍부해 회복과 염증 완화에 탁월해요.",
    nutrition: { kcal: 208, protein: 20, carbs: 0, fat: 13 },
    portion: "1토막 (100g)",
    tags: ["오메가3", "고단백", "항염"],
    mealTimes: ["lunch", "dinner"],
    forCharacters: ["hiker", "runner", "power_walker"],
  },
  {
    id: 7,
    name: "바나나",
    emoji: "🍌",
    description: "운동 전 빠른 에너지 공급. 칼륨으로 근경련 예방도 돼요.",
    nutrition: { kcal: 89, protein: 1, carbs: 23, fat: 0 },
    portion: "1개 (120g)",
    tags: ["빠른에너지", "칼륨", "간편"],
    mealTimes: ["breakfast", "snack"],
    forCharacters: ["runner", "power_walker", "hiker"],
  },
  {
    id: 8,
    name: "아보카도",
    emoji: "🥑",
    description: "건강한 지방과 비타민E가 풍부해요. 포만감도 오래가요.",
    nutrition: { kcal: 160, protein: 2, carbs: 9, fat: 15 },
    portion: "1/2개 (75g)",
    tags: ["건강한지방", "비타민E", "항산화"],
    mealTimes: ["breakfast", "lunch"],
    forCharacters: ["walker", "power_walker"],
  },
  {
    id: 9,
    name: "오트밀",
    emoji: "🥣",
    description: "베타글루칸 성분이 콜레스테롤 조절과 포만감을 도와줘요.",
    nutrition: { kcal: 150, protein: 5, carbs: 27, fat: 3 },
    portion: "1/2컵 건조 (40g)",
    tags: ["식이섬유", "복합탄수화물", "포만감"],
    mealTimes: ["breakfast"],
    forCharacters: ["walker", "power_walker", "runner"],
  },
  {
    id: 10,
    name: "두부",
    emoji: "🫘",
    description: "식물성 단백질의 대표 식품. 칼로리도 낮아요.",
    nutrition: { kcal: 80, protein: 9, carbs: 2, fat: 4 },
    portion: "1/4모 (100g)",
    tags: ["식물성단백질", "저칼로리", "칼슘"],
    mealTimes: ["lunch", "dinner"],
    forCharacters: ["walker", "hiker"],
  },
  {
    id: 11,
    name: "나물반찬",
    emoji: "🥬",
    description: "각종 비타민과 식이섬유가 풍부한 한국 전통 반찬이에요.",
    nutrition: { kcal: 50, protein: 2, carbs: 8, fat: 1 },
    portion: "1접시 (100g)",
    tags: ["식이섬유", "비타민", "저칼로리"],
    mealTimes: ["lunch", "dinner"],
    forCharacters: ["walker", "hiker"],
  },
  {
    id: 12,
    name: "된장찌개",
    emoji: "🍲",
    description: "발효 대두로 만든 한식 국. 단백질과 유익균이 풍부해요.",
    nutrition: { kcal: 80, protein: 6, carbs: 8, fat: 3 },
    portion: "1그릇 (200g)",
    tags: ["발효식품", "단백질", "한식"],
    mealTimes: ["lunch", "dinner"],
    forCharacters: ["walker", "hiker", "power_walker"],
  },
  {
    id: 13,
    name: "잡곡밥",
    emoji: "🍙",
    description: "현미·보리·콩 등 잡곡을 섞어 영양이 더 풍부해요.",
    nutrition: { kcal: 200, protein: 5, carbs: 42, fat: 1 },
    portion: "1공기 (210g)",
    tags: ["복합탄수화물", "식이섬유", "한식"],
    mealTimes: ["lunch", "dinner"],
    forCharacters: ["walker", "hiker", "runner"],
  },
  {
    id: 14,
    name: "미역국",
    emoji: "🫕",
    description: "미네랄과 식이섬유가 풍부. 칼로리가 낮아 다이어트에 좋아요.",
    nutrition: { kcal: 40, protein: 3, carbs: 5, fat: 1 },
    portion: "1그릇 (200g)",
    tags: ["저칼로리", "미네랄", "한식"],
    mealTimes: ["lunch", "dinner"],
    forCharacters: ["walker", "power_walker"],
  },
];

// ─────────────────────────────────────────────
// Recommended Menus (세트 메뉴)
// ─────────────────────────────────────────────

export const recommendedMenus: RecommendedMenu[] = [
  {
    id: 1,
    name: "단백질 아침 세트",
    emoji: "🌅",
    description: "근합성과 하루 에너지를 동시에 챙기는 아침",
    mealTime: "breakfast",
    foods: [
      {
        name: "오트밀",
        emoji: "🥣",
        nutrition: { kcal: 150, protein: 5, carbs: 27, fat: 3 },
      },
      {
        name: "삶은계란 2개",
        emoji: "🥚",
        nutrition: { kcal: 156, protein: 12, carbs: 2, fat: 10 },
      },
      {
        name: "바나나",
        emoji: "🍌",
        nutrition: { kcal: 89, protein: 1, carbs: 23, fat: 0 },
      },
    ],
    totalNutrition: { kcal: 395, protein: 18, carbs: 52, fat: 13 },
    tags: ["고단백", "복합탄수화물", "간편"],
    forCharacters: ["runner", "power_walker", "hiker"],
    prepTime: 10,
  },
  {
    id: 2,
    name: "가벼운 아침 세트",
    emoji: "🌤️",
    description: "소화 부담 없이 가볍게 시작하는 아침",
    mealTime: "breakfast",
    foods: [
      {
        name: "그릭요거트",
        emoji: "🥛",
        nutrition: { kcal: 100, protein: 10, carbs: 6, fat: 3 },
      },
      {
        name: "아보카도 토스트",
        emoji: "🥑",
        nutrition: { kcal: 220, protein: 5, carbs: 22, fat: 13 },
      },
    ],
    totalNutrition: { kcal: 320, protein: 15, carbs: 28, fat: 16 },
    tags: ["가벼운", "건강한지방", "항산화"],
    forCharacters: ["walker", "power_walker"],
    prepTime: 5,
  },
  {
    id: 3,
    name: "고단백 점심 세트",
    emoji: "☀️",
    description: "오후 운동을 위한 에너지와 단백질 충전",
    mealTime: "lunch",
    foods: [
      {
        name: "현미밥",
        emoji: "🍚",
        nutrition: { kcal: 210, protein: 5, carbs: 44, fat: 2 },
      },
      {
        name: "닭가슴살",
        emoji: "🍗",
        nutrition: { kcal: 165, protein: 31, carbs: 0, fat: 4 },
      },
      {
        name: "샐러드",
        emoji: "🥗",
        nutrition: { kcal: 50, protein: 2, carbs: 8, fat: 2 },
      },
    ],
    totalNutrition: { kcal: 425, protein: 38, carbs: 52, fat: 8 },
    tags: ["고단백", "저지방", "운동전후"],
    forCharacters: ["runner", "power_walker"],
    prepTime: 15,
  },
  {
    id: 4,
    name: "연어 점심 세트",
    emoji: "🐟",
    description: "오메가3로 피로 회복과 항염을 동시에",
    mealTime: "lunch",
    foods: [
      {
        name: "연어구이",
        emoji: "🐟",
        nutrition: { kcal: 208, protein: 20, carbs: 0, fat: 13 },
      },
      {
        name: "현미밥",
        emoji: "🍚",
        nutrition: { kcal: 210, protein: 5, carbs: 44, fat: 2 },
      },
      {
        name: "된장국",
        emoji: "🍲",
        nutrition: { kcal: 50, protein: 4, carbs: 5, fat: 2 },
      },
    ],
    totalNutrition: { kcal: 468, protein: 29, carbs: 49, fat: 17 },
    tags: ["오메가3", "항염", "균형잡힌"],
    forCharacters: ["hiker", "runner", "walker"],
    prepTime: 20,
  },
  {
    id: 5,
    name: "한식 점심 세트",
    emoji: "🍱",
    description: "균형 잡힌 한국식 점심. 든든하고 건강해요.",
    mealTime: "lunch",
    foods: [
      {
        name: "잡곡밥",
        emoji: "🍙",
        nutrition: { kcal: 200, protein: 5, carbs: 42, fat: 1 },
      },
      {
        name: "된장찌개",
        emoji: "🍲",
        nutrition: { kcal: 80, protein: 6, carbs: 8, fat: 3 },
      },
      {
        name: "나물반찬",
        emoji: "🥬",
        nutrition: { kcal: 50, protein: 2, carbs: 8, fat: 1 },
      },
    ],
    totalNutrition: { kcal: 330, protein: 13, carbs: 58, fat: 5 },
    tags: ["한식", "균형잡힌", "든든한"],
    forCharacters: ["walker", "hiker", "power_walker"],
    prepTime: 10,
  },
  {
    id: 6,
    name: "회복 저녁 세트",
    emoji: "🌙",
    description: "운동 후 근육 회복을 위한 저녁 식사",
    mealTime: "dinner",
    foods: [
      {
        name: "닭가슴살",
        emoji: "🍗",
        nutrition: { kcal: 165, protein: 31, carbs: 0, fat: 4 },
      },
      {
        name: "고구마",
        emoji: "🍠",
        nutrition: { kcal: 130, protein: 2, carbs: 30, fat: 0 },
      },
      {
        name: "두부된장국",
        emoji: "🫘",
        nutrition: { kcal: 100, protein: 10, carbs: 6, fat: 4 },
      },
    ],
    totalNutrition: { kcal: 395, protein: 43, carbs: 36, fat: 8 },
    tags: ["근회복", "고단백", "저지방"],
    forCharacters: ["runner", "power_walker", "hiker"],
    prepTime: 20,
  },
  {
    id: 7,
    name: "가벼운 저녁 세트",
    emoji: "🌛",
    description: "소화 부담 없이 몸을 회복시키는 저녁",
    mealTime: "dinner",
    foods: [
      {
        name: "삶은계란",
        emoji: "🥚",
        nutrition: { kcal: 78, protein: 6, carbs: 1, fat: 5 },
      },
      {
        name: "고구마",
        emoji: "🍠",
        nutrition: { kcal: 130, protein: 2, carbs: 30, fat: 0 },
      },
      {
        name: "그릭요거트",
        emoji: "🥛",
        nutrition: { kcal: 100, protein: 10, carbs: 6, fat: 3 },
      },
    ],
    totalNutrition: { kcal: 308, protein: 18, carbs: 37, fat: 8 },
    tags: ["가벼운", "소화용이", "야식대용"],
    forCharacters: ["walker", "hiker"],
    prepTime: 5,
  },
  {
    id: 8,
    name: "한식 저녁 세트",
    emoji: "🥢",
    description: "소화 편한 한식으로 하루를 마무리해요.",
    mealTime: "dinner",
    foods: [
      {
        name: "잡곡밥",
        emoji: "🍙",
        nutrition: { kcal: 200, protein: 5, carbs: 42, fat: 1 },
      },
      {
        name: "미역국",
        emoji: "🫕",
        nutrition: { kcal: 40, protein: 3, carbs: 5, fat: 1 },
      },
      {
        name: "나물반찬",
        emoji: "🥬",
        nutrition: { kcal: 50, protein: 2, carbs: 8, fat: 1 },
      },
      {
        name: "두부",
        emoji: "🫘",
        nutrition: { kcal: 80, protein: 9, carbs: 2, fat: 4 },
      },
    ],
    totalNutrition: { kcal: 370, protein: 19, carbs: 57, fat: 7 },
    tags: ["한식", "가벼운", "균형잡힌"],
    forCharacters: ["walker", "hiker"],
    prepTime: 10,
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export const getMenusByMealTime = (time: MealTime): RecommendedMenu[] =>
  recommendedMenus.filter((m) => m.mealTime === time);

export const getMenusForCharacter = (type: CharacterType): RecommendedMenu[] =>
  recommendedMenus.filter((m) => m.forCharacters.includes(type));

export const getFoodsForCharacter = (type: CharacterType): RecommendedFood[] =>
  recommendedFoods.filter((f) => f.forCharacters.includes(type));
