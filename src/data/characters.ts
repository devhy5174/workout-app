// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type CharacterType = "walker" | "power_walker" | "runner" | "hiker";

export interface DietMacros {
  protein: number; // 목표 비율 (%)
  carbs: number;
  fat: number;
}

export interface CharacterDietProfile {
  description: string;
  dailyKcalTarget: number;
  macros: DietMacros;
  focus: string[];
  recommendedFoods: string[];
  avoidFoods: string[];
  mealTip: string;
}

export interface Character {
  id: number;
  type: CharacterType;
  emoji: string;
  name: string;
  style: string;
  kcalPerMin: number; // 분당 칼로리 소모
  bonus: string;
  bonusIcon: string;
  gradient: string;
  bg: string;
  border: string;
  dietProfile: CharacterDietProfile;
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

export const characters: Character[] = [
  {
    id: 1,
    type: "walker",
    emoji: "🚶",
    name: "산책러",
    style: "천천히 걷기 특화",
    kcalPerMin: 3,
    bonus: "연속 운동 포인트 2배",
    bonusIcon: "🔥",
    gradient: "from-green-400 to-teal-400",
    bg: "bg-green-50",
    border: "border-green-400",
    dietProfile: {
      description: "꾸준한 산책엔 가벼운 저칼로리 식단이 딱!",
      dailyKcalTarget: 1800,
      macros: { protein: 20, carbs: 55, fat: 25 },
      focus: ["저칼로리", "식이섬유", "수분 충전"],
      recommendedFoods: ["현미밥", "나물반찬", "두부", "과일", "두유"],
      avoidFoods: ["튀긴 음식", "고열량 디저트", "탄산음료"],
      mealTip: "산책 전 가벼운 간식으로 에너지를 충전하세요.",
    },
  },
  {
    id: 2,
    type: "power_walker",
    emoji: "🚶‍♂️",
    name: "파워워커",
    style: "빠르게 걷기 특화",
    kcalPerMin: 5,
    bonus: "목표 달성 포인트 2배",
    bonusIcon: "⚡",
    gradient: "from-orange-400 to-amber-400",
    bg: "bg-orange-50",
    border: "border-orange-400",
    dietProfile: {
      description: "빠른 워킹을 위한 탄수화물·단백질 균형 식단",
      dailyKcalTarget: 2100,
      macros: { protein: 28, carbs: 52, fat: 20 },
      focus: ["고단백", "빠른 회복", "탄수화물 보충"],
      recommendedFoods: ["바나나", "닭가슴살", "현미밥", "두유", "아몬드"],
      avoidFoods: ["기름진 음식", "술", "과도한 설탕"],
      mealTip: "운동 30분 전 바나나 한 개로 빠른 에너지를 공급하세요.",
    },
  },
  {
    id: 3,
    type: "runner",
    emoji: "🏃",
    name: "러너",
    style: "러닝 특화",
    kcalPerMin: 8,
    bonus: "거리 달성 보너스",
    bonusIcon: "🏅",
    gradient: "from-red-400 to-rose-400",
    bg: "bg-red-50",
    border: "border-red-400",
    dietProfile: {
      description: "고강도 러닝을 위한 고탄수화물 파워 식단",
      dailyKcalTarget: 2400,
      macros: { protein: 30, carbs: 50, fat: 20 },
      focus: ["고탄수화물", "빠른 에너지", "근육 회복"],
      recommendedFoods: [
        "오트밀",
        "닭가슴살",
        "고구마",
        "프로틴쉐이크",
        "바나나",
      ],
      avoidFoods: ["기름진 음식", "술", "무거운 음식"],
      mealTip: "달리기 직후 30분 이내에 단백질+탄수화물을 함께 섭취하세요.",
    },
  },
  {
    id: 4,
    type: "hiker",
    emoji: "🏔️",
    name: "등산가",
    style: "등산 특화",
    kcalPerMin: 6,
    bonus: "파티 참여 보너스",
    bonusIcon: "🗺️",
    gradient: "from-yellow-500 to-orange-400",
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    dietProfile: {
      description: "장시간 등산을 위한 지속 에너지 공급 식단",
      dailyKcalTarget: 2500,
      macros: { protein: 25, carbs: 50, fat: 25 },
      focus: ["지속 에너지", "휴대 간편", "전해질"],
      recommendedFoods: [
        "에너지바",
        "견과류",
        "건과일",
        "닭가슴살 도시락",
        "고구마",
      ],
      avoidFoods: ["무거운 음식", "빠른 소화 당류", "가공스낵"],
      mealTip: "등산 전날 탄수화물을 충분히 섭취해 글리코겐을 채우세요.",
    },
  },
];

export const getCharacterByType = (
  type: CharacterType,
): Character | undefined => characters.find((c) => c.type === type);

export const getCharacterById = (
  id: number,
): Character | undefined => characters.find((c) => c.id === id);
