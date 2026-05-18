export type CharacterWorkoutDiet = {
  meals: { emoji: string; name: string }[];
  tip: string;
};

export const DIET_BY_CHARACTER: Record<number, CharacterWorkoutDiet> = {
  1: {
    meals: [
      { emoji: "🍚", name: "현미밥" },
      { emoji: "🥬", name: "나물반찬" },
    ],
    tip: "산책 후 가볍게 식이섬유를 채워보세요.",
  },
  2: {
    meals: [
      { emoji: "⚡", name: "에너지바" },
      { emoji: "🥛", name: "우유" },
    ],
    tip: "운동 후 탄수화물+단백질로 빠르게 회복하세요.",
  },
  3: {
    meals: [
      { emoji: "🍌", name: "바나나" },
      { emoji: "🍗", name: "닭가슴살" },
    ],
    tip: "달리기 직후 단백질+탄수화물로 빠르게 회복하세요.",
  },
  4: {
    meals: [
      { emoji: "🥜", name: "견과류" },
      { emoji: "🍎", name: "과일" },
    ],
    tip: "활동 후 지속 에너지를 위해 견과류를 드세요.",
  },
};

export function getCharacterWorkoutDiet(
  activityTypeId: number,
): CharacterWorkoutDiet | null {
  return DIET_BY_CHARACTER[activityTypeId] ?? null;
}
